const { Client } = require('fnbr');
const colors = require('colors');
const config = require("./config.json");

console.log('fortnitejs-bot made by xMistt. Massive credit to This Nils for creating the library.'.cyan);
console.log('Discord server: https://discord.gg/fnpy - For support, questions, etc.'.cyan);

const client = new Client({
    auth: {
        authorizationCode: async () => Client.consoleQuestion('Please enter a valid authorization code: ')
    },
});

client.on('friend:message', (friendMessage) => {
    console.log(`Message from ${friendMessage.author.displayName}: ${friendMessage.content}`);
    var args = friendMessage.content.split(" ");

    if(args[0].toLowerCase() == '!cid') {
        client.party.me.setOutfit(args[1])
        friendMessage.reply(`Skin set to ${args[1]}.`);
        console.log(`Skin set to ${args[1]}.`)
    }
    else if(args[0].toLowerCase() == '!eid') {
        client.party.me.setEmote(args[1])
        friendMessage.reply(`Emote set to ${args[1]}.`);
        console.log(`Emote set to ${args[1]}.`)
    }
    else if(args[0].toLowerCase() == '!stop') {
        client.party.me.clearEmote()
        friendMessage.reply('Stopped emoting.');
    }
    else if(args[0].toLowerCase() == '!pickaxe_id') {
        client.party.me.setPickaxe(args[1])
        friendMessage.reply(`Pickaxe set to ${args[1]}.`);
        console.log(`Pickaxe set to ${args[1]}.`)
    }
    else if(args[0].toLowerCase() == '!ready') {
        client.party.me.setReadiness(true)
        friendMessage.reply('Ready!');
    }
    else if(args[0].toLowerCase() == '!unready') {
        client.party.me.setReadiness(false)
        friendMessage.reply('Unready!');
    }
    else {
        friendMessage.reply('Command not found, are you sure it exists?')
    }
});

client.on('party:invite', (partyInvitation) => {
    partyInvitation.accept()
    console.log(`Accepted party invite from ${partyInvitation.sender.displayName}.`)
});

client.on('party:member:joined', (partyMember) => {
    client.party.me.setOutfit(config.CID)
    client.party.me.setBackpack(config.BID)
    client.party.me.setPickaxe(config.PICKAXE_ID)

    Client.sleep(2000)

    client.party.me.setEmote(config.EID)
});

(async () => {
    await client.login();
    console.log(`Client ready as ${client.user.displayName}.`.green);
})();