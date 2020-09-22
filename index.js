const fetch = require('node-fetch');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

var nota = 0;
var token = '';
var baseUrl = '';
var idQuestao4 = '';
var idQuestao6 = '';
const bodyQuestao04 = {
    'title': 'Lavar louca',
    'description': 'Lavar louca acumulada de 3 dias',
    'isDone': false,
    'isPriority': false
};

function questaoBase(options, successCallback) {
    return new Promise((resolve, reject) => {
        const url = `${baseUrl}${options.url || ''}`;
        const ignoreToken = options.ignoreToken || false;

        console.log(`Início da requisição para ${url}`)

        const payload = {
            method: options.method || 'GET',
            headers: {}
        }
        if (!!options.body) {
            payload.body = JSON.stringify(options.body)
        }
        if (!!options.body) {
            payload.headers['Content-Type'] = 'application/json';
        }

        if (token && !options.ignoreToken) {
            payload.headers['x-access-token'] = token;
        }

        fetch(`${baseUrl}${options.url || ''}`, payload)
            .then(resp => {
                const targetStatus = options.targetStatus || 200;
                if (resp.status == targetStatus) {
                    return resp.json()
                } else {
                    return `Resposta não ${targetStatus} para ${url}, status recebido ${resp.status}`
                }
            })
            .then(json => {
                if (successCallback(json)) {
                    console.log(`Requisição para ${url} correta`)
                    console.log(`nota=${++nota}`)
                } else {
                    console.log(`Requisição para ${url} errada`)
                    console.log(`nota=${nota}`)
                }
                console.log('\n\n');
                resolve();
            })
            .catch(err => {
                console.log(`Erro ao executar requisicao para ${url}\n`, err)
                console.log('\n\n');
                reject(err);
            })
    })
}

function questao01() {
    console.log('01) Simples requisição para a raiz do sistema. Ela não deve ser barrada pelo filtro de segurança.');
    return questaoBase(
        { url: '/' },
        (json) => json.message === 'ok')
}

function questao02() {
    console.log('02) Requisição passando dados incorretos para o login. Repare no código de resposta e mensagem');
    return questaoBase({
        url: '/login',
        method: 'POST',
        targetStatus: 401,
        body: {
            'username': 'usuario',
            'password': 'senhaErrada'
        }
    }, (resp) => {
        if (!resp.message) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        }
        if (resp.message === 'Error in username or password') {
            return true;
        } else {
            console.log(`Mensagem esperada 'Error in username or password'`)
            console.log(`Mensagem obtida '${resp.message}'`)
            return false;
        }
    });
}

function questao03() {
    console.log('03) Requisição para realizar o login. O esperado é que a requisição seja feita com sucesso e o token devolvido por essa requisição será usado nas próximas requisições.');
    return questaoBase({
        url: '/login',
        method: 'POST',
        body: {
            'username': 'usuario',
            'password': '123456'
        }
    }, (resp) => {
        if (!resp.token) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            token = resp.token
            return true
        }
    });
}

function questao04() {
    console.log('04) Requisição adicionando uma nova tarefa no sistema. O id será usado para referência.');

    return questaoBase({
        url: '/tasks',
        method: 'POST',
        targetStatus: 201,
        body: bodyQuestao04
    }, (resp) => {
        if (!resp.id ||
            resp.title !== bodyQuestao04.title ||
            resp.description !== bodyQuestao04.description ||
            resp.isDone !== bodyQuestao04.isDone ||
            resp.isPriority !== bodyQuestao04.isPriority) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            idQuestao4 = resp.id;
            return true
        }
    });
}

// function questao05() {
//     console.log('05) Requisição listando as tarefas. Deve contar a tarefa adicionada na questão 4.');

//     return questaoBase({ url: '/tasks' }, (resp) => {
//         if (!Array.isArray(resp) ||
//             resp.filter(t => t.id == idQuestao4).length !== 1) {
//             console.log('Resposta obtida com erro');
//             console.log(resp);
//             return false;
//         } else {
//             return true
//         }
//     });
// }

function questao05() {
    console.log('05) Requisição adicionando uma outra tarefa no sistema.');

    const body = {
        'title': 'Levar cachorro para passear',
        'description': 'O cachorro esta doido para passear',
        'isDone': false,
        'isPriority': false
    };

    return questaoBase({
        url: '/tasks',
        method: 'POST',
        targetStatus: 201,
        body
    }, (resp) => {
        if (!resp.id ||
            resp.title !== body.title ||
            resp.description !== body.description ||
            resp.isDone !== body.isDone ||
            resp.isPriority !== body.isPriority) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            idQuestao6 = resp.id;
            return true
        }
    });
}

function questao06() {
    console.log('06) Requisição listando as tarefas. Deve contar a tarefa adicionada na questão 4 e na questão 6 (pode conter outras tarefas, não tem problema).');

    return questaoBase({ url: '/tasks' }, (resp) => {
        if (!Array.isArray(resp) ||
            resp.filter(t => t.id == idQuestao4).length !== 1 ||
            resp.filter(t => t.id == idQuestao6).length !== 1) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            return true
        }
    });
}

function questao07() {
    console.log('07) Requisição para alterar a tarefa gravada na questão 4, o atributo `isDone` será alterado para true.');

    bodyQuestao04.isDone = true

    return questaoBase({
        url: `/tasks/${idQuestao4}`,
        method: 'PUT',
        body: bodyQuestao04
    }, (resp) => {
        if (resp.id !== idQuestao4 ||
            resp.title !== bodyQuestao04.title ||
            resp.description !== bodyQuestao04.description ||
            resp.isDone !== bodyQuestao04.isDone ||
            resp.isPriority !== bodyQuestao04.isPriority) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            return true
        }
    });
}

function questao08() {
    console.log(`08) Buscando a tarefa ${idQuestao4} (gravada na questão 04) depois de alterada`);

    return questaoBase({ url: `/tasks/${idQuestao4}` }, (resp) => {
        if (resp.id !== idQuestao4 ||
            resp.title !== bodyQuestao04.title ||
            resp.description !== bodyQuestao04.description ||
            resp.isDone !== bodyQuestao04.isDone ||
            resp.isPriority !== bodyQuestao04.isPriority) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            return true
        }
    });
}

function questao09() {
    console.log('09) Apagando tarefa gravada na questão 04');

    return questaoBase({ url: `/tasks/${idQuestao4}`, method: 'DELETE' }, (resp) => {
        if (resp.id !== idQuestao4 ||
            resp.title !== bodyQuestao04.title ||
            resp.description !== bodyQuestao04.description ||
            resp.isDone !== bodyQuestao04.isDone ||
            resp.isPriority !== bodyQuestao04.isPriority) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            return true
        }
    });
}

function questao10() {
    console.log('10) Requisição listando as tarefas. Não deve contar a tarefa adicionada na questão 4 e deve conter a tarefa da questão 6 (pode conter outras tarefas, não tem problema).');

    return questaoBase({ url: '/tasks' }, (resp) => {
        if (!Array.isArray(resp) ||
            resp.filter(t => t.id == idQuestao4).length !== 0 ||
            resp.filter(t => t.id == idQuestao6).length !== 1) {
            console.log('Resposta obtida com erro');
            console.log(resp);
            return false;
        } else {
            return true
        }
    });
}

readline.question(`Qual o endereço do seu sistema (http://localhost:3000) ?\n`, (url) => {
    readline.close();
    
    if (!url) {
        baseUrl = 'http://localhost:3000';
    }else{
        baseUrl = url;
    }

    console.log('Configurando url ', url);

    questao01()
        .then(() => questao02())
        .then(() => questao03())
        .then(() => questao04())
        .then(() => questao05())
        .then(() => questao06())
        .then(() => questao07())
        .then(() => questao08())
        .then(() => questao09())
        .then(() => questao10())
        .then(() => console.log(`Nota final: ${nota}`))
        .catch(err => {
            console.log(err);
            console.log('Erro!', `Nota final: ${nota}`)
        })

})