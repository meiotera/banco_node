// modulos externos
const chalk = require('chalk');
const inquirer = require('inquirer');

// modulos internos
const fs = require('fs');

operation();

function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ]
        },
    ]).then((resposta) => {
        const action = resposta['action'];

        switch (action) {
            case 'Criar conta':
                menssagemInicial();
                break;
            case 'Consultar saldo':
                mostraSaldo()
                break;
            case 'Depositar':
                depositar()
                break;
            case 'Sacar':
                saque()
                break;
            case 'Sair':
                console.log('Saindo...')
                process.exit();
        }
        // if (action === 'Criar conta') {
        //     menssagemInicial();
        // }

    }).catch((err) => console.log(err));

}

// criar conta
function menssagemInicial() {
    console.log(chalk.bgGreen(`Obrigado por escolher nosso banco`));
    console.log(chalk.green(`Defina as opçoes de sua conta a seguir`));

    construirConta();
}

function construirConta() {
    inquirer.prompt([
        {
            name: 'p1',
            message: chalk.underline.italic(`Qual seu nome? `)
        },
        {
            name: 'p2',
            message: chalk.underline.italic(`Informe seu email `)
        }
    ]).then((resposta) => {
        const usuarioConta = resposta['p1'];
        const usuarioEmail = resposta['p2'];
        const numContaUsuario = gerarNumeroConta();

        console.info('Conta criada com sucesso! salve os dados de sua conta:');
        console.info(chalk.bold.bgCyan(`Usuário: ${usuarioConta}, Email: ${usuarioEmail}, Número da conta: ${numContaUsuario}`));

        criaBd(usuarioConta, usuarioEmail, numContaUsuario);
        operation();

    }).catch(err => console.log(err));
}

function gerarNumeroConta() {
    let numConta = [];

    while (numConta.length < 5) {
        let numerosAleatorios = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
        numConta.push(numerosAleatorios);

        if (fs.existsSync(`accounts/${numConta.join('')}.json`)) {
            numConta = [];
        }
    }

    return numConta.join('');
}

function criaBd(usuarioConta, usuarioEmail, numContaUsuario) {
    if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts');
    }

    if (!fs.existsSync(`accounts/${numContaUsuario}.json`)) {
        fs.writeFileSync(
            `accounts/${numContaUsuario}.json`,
            `{"nome": "${usuarioConta}", "saldo": 0, "email": "${usuarioEmail}"}`,
            function (err) {
                console.log(err)
            }
        )
    }
}

function mostraSaldo() {
    inquirer.prompt([
        {
            name: 'conta',
            message: 'Qual o número da conta? '
        }
    ]).then((resposta) => {
        const conta = pegarConta(resposta['conta']);
        const saldo = conta.saldo;

        if(conta) {
            console.log(chalk.white.bold.bgCyan(`Seu saldo é de:  R$${saldo.toFixed(2)} `));
            operation();
        } else {
            return mostraSaldo()
        }

    });
}

function depositar() {
    inquirer.prompt([
        {
            name: 'conta',
            message: 'Digite o número da conta: '
        }
    ]).then((resposta) => {        
        const menssagem = 'Depositar';              
        const conta = pegarConta(resposta['conta']);       
        
        if(!conta) return depositar();        

        valor(menssagem, (valorDeposito) => {
            const novoSaldo = parseFloat(valorDeposito) + parseFloat(conta.saldo);

            conta.saldo = novoSaldo;

            fs.writeFileSync(
                `accounts/${resposta['conta']}.json`,
                JSON.stringify(conta),
                function(err) {
                    if(err) {
                        console.log(err)
                    } 
                },
                console.log(chalk.bgGreen(`Seu deposito de R$${valorDeposito} foi realizado com sucesso`))
            )
            operation()
        })   
    })

}

function pegarConta(conta) {
    const caminhoConta = `accounts/${conta}.json`;  

    if(!fs.existsSync(caminhoConta)) {
        console.log(chalk.bgRed.bold(`A conta ${conta} não existe!`));       
        return false;
    }

    const contaJSON = fs.readFileSync(caminhoConta, {
        encoding: 'utf8',
        flag: 'r'
    }); 
    return JSON.parse(contaJSON)
}

function valor(menssagem, callback) {
    inquirer.prompt([
        {
            name: 'valor',
            message: chalk.green(`Digite o valor para ${menssagem}`)
        }
    ]).then((resposta) => {        
        const valor = parseFloat(resposta['valor']);
        if(isNaN(valor)) {
            console.log(chalk.bgRed.white(`Valor inválido, tente novamente`));
            valor(menssagem, callback);
        } else {
            callback(valor)
        }
    })
}

function saque() {
    inquirer.prompt([
        {
            name: 'conta',
            message: 'Digite o número da conta: '
        }
    ]).then((resposta) => {        
        const menssagem = 'sacar';              
        const conta = pegarConta(resposta['conta']);       
        
        if(!conta) return depositar();        

        valor(menssagem, (valorSaque) => {
            const novoSaldo = parseFloat(conta.saldo) - parseFloat(valorSaque);

            conta.saldo = novoSaldo;

            fs.writeFileSync(
                `accounts/${resposta['conta']}.json`,
                JSON.stringify(conta),
                function(err) {
                    if(err) {
                        console.log(err)
                    } 
                },
                console.log(chalk.bgGreen(`Seu saque de R$${valorSaque} foi realizado com sucesso`))
            )

            operation()
        })   
    })
}