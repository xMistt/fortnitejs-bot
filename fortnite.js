const { Client } = require('fnbr');
const colors = require('colors');
const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config.json');
const deviceAuths = require('./device_auths.json');

console.log('fortnitejs-bot made by xMistt. Massive credit to This Nils for creating the library.'.cyan)
console.log('Discord server: https://discord.gg/fnpy - For support, questions, etc.'.cyan)

const LookupCosmetic = async (cosmeticType, cosmeticSearch) => {
    const url = 'https://fortnite-api.com/v2/cosmetics/br/search'
                + '?matchMethod=contains'
                + `&name=${cosmeticSearch}`
                + `&backendType=${cosmeticType}`

    return (await fetch(url)).json()

};

var authentication = {}
if (fs.readFileSync('device_auths.json').toString() == '{}') {
    authentication = {authorizationCode: async () => Client.consoleQuestion('Please enter a valid authorization code: ')}
}
else {
    authentication = {
        deviceAuth: {
            deviceId: deviceAuths.device_id,
            accountId: deviceAuths.account_id,
            secret: deviceAuths.secret
        }
    }
}

const client = new Client({
    auth: authentication,
});

client.on('deviceauth:created', (deviceAuthCredentials) => {
    fs.writeFile("device_auths.json", JSON.stringify({
        device_id: deviceAuthCredentials.deviceId,
        account_id: deviceAuthCredentials.accountId,
        secret: deviceAuthCredentials.secret
    }, null, 4), function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
});

client.on('ready', () => {
    console.log(`Client ready as ${client.user.displayName}.`.green)
    // client.setStatus(config.status)
});

client.on('friend:message', (friendMessage) => {
    console.log(`Message from ${friendMessage.author.displayName}: ${friendMessage.content}`)
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
    // else if(args[0].toLowerCase() == '!skin') {
    //     cosmetic = LookupCosmetic("AthenaCharacter", args.slice(1))
    //     client.party.me.setOutfit(cosmetic.data.id)
    //     friendMessage.reply(`Skin set to ${cosmetic.data.id}.`);
    //     console.log(`Skin set to ${cosmetic.data.id}.`)
    // }
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
    client.party.me.setLevel(config.level)

    Client.sleep(2000)

    client.party.me.setEmote(config.EID)
});

(async () => {
    await client.login();
})();