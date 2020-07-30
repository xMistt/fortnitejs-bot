const { Client } = require('fnbr');
const colors = require('colors');
const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config.json');
const deviceAuths = require('./device_auths.json');

console.log('fortnitejs-bot made by xMistt. Massive credit to This Nils and Alex for creating the library.'.cyan)
console.log('Discord server: https://discord.gg/fnpy - For support, questions, etc.'.cyan)

const LookupCosmetic = async (cosmeticType, cosmeticSearch) => {
    const url = 'https://fortnite-api.com/v2/cosmetics/br/search'
                + '?matchMethod=contains'
                + `&name=${cosmeticSearch}`
                + `&backendType=${cosmeticType}`

    return (await fetch(url)).json()
};

var authentication = {}
if (!deviceAuths.account_id) {
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
    status: config.status,
    debug: (config.debug == true) ? console.log : null,
    httpDebug: config.debug,
    xmppDebug: config.debug,
    kairos: {
        cid: "cid_028_ff2b06cf446376144ba408d3482f5c982bf2584cf0f508ee3e4ba4a0fd461a38",
        color: "FF619C"
    }
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

client.on('ready', async () => {
    console.log(`Client ready as ${client.user.displayName}.`.green)
    client.party.me.setOutfit(config.CID)
    client.party.me.setBackpack(config.BID)
    client.party.me.setPickaxe(config.PICKAXE_ID)
    client.party.me.setLevel(config.level)

    client.pendingFriends.forEach(function(pendingFriend) {
        if(config.friendaccept)
        {
            pendingFriend.accept()
            console.log(`Accepted friend request from: ${pendingFriend.displayName}.`)
        } else {
            pendingFriend.abort()
            console.log(`Declined friend request from: ${pendingFriend.displayName}.`)
        }
    });
});

client.on('friend:request', async (pendingFriend) => {
    console.log(`Received friend request from: ${pendingFriend.displayName}.`)
    if(config.friendaccept)
    {
        pendingFriend.accept()
        console.log(`Accepted friend request from: ${pendingFriend.displayName}.`)
    } else {
        pendingFriend.abort()
        console.log(`Declined friend request from: ${pendingFriend.displayName}.`)
    }
});

client.on('party:invite', async (partyInvitation) => {
    partyInvitation.accept()
    console.log(`Accepted party invite from ${partyInvitation.sender.displayName}.`)
});

client.on('party:member:joined', async (partyMember) => {
    client.party.me.clearEmote()
    client.party.me.setEmote(config.EID)
});

client.on('friend:message', async (friendMessage) => {
    console.log(`${friendMessage.author.displayName}: ${friendMessage.content}`)
    
    var args = friendMessage.content.split(" ")
    var command = args[0].toLowerCase()
    var content = args.slice(1).join(" ")

    if(command == '!cid') {
        if(args.length == 1) {
            friendMessage.reply('Failed to execute commands as there are missing requirements, please check usage.')
            return
        }

        client.party.me.setOutfit(args[1])
        friendMessage.reply(`Skin set to ${args[1]}.`);
        console.log(`Skin set to ${args[1]}.`)
    }
    else if(command == '!eid') {
        if(args.length == 1) {
            friendMessage.reply('Failed to execute commands as there are missing requirements, please check usage.')
            return
        }

        client.party.me.clearEmote()
        client.party.me.setOutfit(args[1])
        friendMessage.reply(`Emote set to ${args[1]}.`);
        console.log(`Emote set to ${args[1]}.`)
    }
    else if(command == '!stop') {
        client.party.me.clearEmote()
        friendMessage.reply('Stopped emoting.');
    }
    else if(command == '!pickaxe_id') {
        if(args.length == 1) {
            friendMessage.reply('Failed to execute commands as there are missing requirements, please check usage.')
            return
        }

        client.party.me.setPickaxe(args[1])
        friendMessage.reply(`Pickaxe set to ${args[1]}.`);
        console.log(`Pickaxe set to ${args[1]}.`)
    }
    else if(command == '!ready') {
        client.party.me.setReadiness(true)
        friendMessage.reply('Ready!');
    }
    else if(command == '!unready') {
        client.party.me.setReadiness(false)
        friendMessage.reply('Unready!');
    }
    else if(command == '!skin') {
        if(args.length == 1) {
            friendMessage.reply('Failed to execute commands as there are missing requirements, please check usage.')
            return
        }

        const cosmetic = await LookupCosmetic("AthenaCharacter", content)
        
        if(cosmetic.status == 200) {
            client.party.me.setOutfit(cosmetic.data.id)
            friendMessage.reply(`Skin set to ${cosmetic.data.id}.`);
            console.log(`Skin set to ${cosmetic.data.id}.`)
        } else {
            friendMessage.reply(`Failed to find a skin with the name: ${content}.`)
            console.log(`Failed to find a skin with the name: ${content}.`)
        }
    }
    else if(command == '!emote') {
        if(args.length == 1) {
            friendMessage.reply('Failed to execute commands as there are missing requirements, please check usage.')
            return
        }

        const cosmetic = await LookupCosmetic("AthenaDance", content)
        
        if(cosmetic.status == 200) {
            client.party.me.clearEmote()
            client.party.me.setEmote(cosmetic.data.id)
            friendMessage.reply(`Emote set to ${cosmetic.data.id}.`);
            console.log(`Emote set to ${cosmetic.data.id}.`)
        } else {
            friendMessage.reply(`Failed to find an emote with the name: ${content}.`)
            console.log(`Failed to find an emote with the name: ${content}.`)
        }
    }
    else if(command == '!purpleskull') {
        client.party.me.setOutfit(
            'CID_030_Athena_Commando_M_Halloween',
            [{ item: 'AthenaCharacter', channel: 'clothing_color', variant: 1}]
        )
    }
    else {
        friendMessage.reply('Command not found, are you sure it exists?')
    }
});

(async () => {
    await client.login();
})();