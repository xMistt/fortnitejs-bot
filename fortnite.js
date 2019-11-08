const fetch = require("node-fetch");
const EGClient = require('epicgames-client').Client;
const Fortnite = require('epicgames-fortnite-client');
const { ESubGame } = Fortnite;
const { EPlatform, EInputType, EPartyPrivacy } = require('epicgames-client');
const { email, password, log, CID, BID, EID, PICKAXE_ID, level, banner, banner_color, friendaccept } = require("./config.json");

let eg = new EGClient({ 
  email: email, 
  password: password,
  debug: log,
  defaultPartyConfig: {
 	  privacy: EPartyPrivacy.PUBLIC,
  	joinConfirmation: false,
  	joinability: 'OPEN', 
  	maxSize: 16,
	  subType: 'default',
	  type: 'default',
	  inviteTTL: 14400,
  	chatEnabled: true,
  }
});

// Credit to Terbau.
async function setOutfitVariants(member, asset, key, variants) {
  await member.meta.setCosmeticLoadout({
    characterDef: asset,
    characterEKey: key || '',
    variants: variants || []
  })
}

async function BenBotRequest(cosmeticType, cosmeticSearch) {
  const response = await fetch(`http://benbotfn.tk:8080/api/cosmetics/search/multiple?displayName=${cosmeticSearch}`);

  if (!response.ok)
    throw oops;

  const queries = await response.json();

  return Object.values(queries)
    .find(({ type }) => type === cosmeticType)
    .id;

}
    
    eg.init().then(async (success) => {

      var current_party;

      if(!success)
        throw new Error('Cannot initialize EpicGames launcher.');

      if(!await eg.login())
        throw new Error('Cannot login on EpicGames account.');

        const fortnite = await eg.runGame(Fortnite);
        
        const br = await fortnite.runSubGame(ESubGame.BattleRoyale);

      fortnite.communicator.on('party:member:joined', async (member) => {
        console.log(`Member#${member.id} joined!`);
        console.log(`Members count: ${fortnite.party.members.length}`);

          fortnite.party.me.setOutfit("/Game/Athena/Items/Cosmetics/Characters/" + CID + "." + CID);

          fortnite.party.me.setBackpack("/Game/Athena/Items/Cosmetics/Backpacks/" + BID + "." + BID);

          fortnite.party.me.setPickaxe("/Game/Athena/Items/Cosmetics/Pickaxes/" + PICKAXE_ID + "." + PICKAXE_ID);

          fortnite.party.me.setEmote("/Game/Athena/Items/Cosmetics/Dances/" + EID + "." + EID);

          fortnite.party.me.setBattlePass(false, 0, 0, 0);
          
          fortnite.party.me.setBanner(level, banner, banner_color);
      });

      fortnite.communicator.on('party:invitation', async (invitation) => {
        current_party = invitation.party;
        await invitation.accept()
      });

      fortnite.communicator.on('friend:request', async (friendops) => {
        if(friendaccept == "true") {
          eg.acceptFriendRequest(friendops.friend.id)
        }else {
          eg.declineFriendRequest(friendops.friend.id)
        }
      });

      eg.communicator.on('friend:message', async (data) => {

        var args = data.message.split(" ");
        var skinContent = data.message.replace(/!skin /g, "").replace(/ /g, "+");

        if(args[0].includes('CID_')){
          fortnite.party.me.setOutfit("/Game/Athena/Items/Cosmetics/Characters/" + args[0] + "." + args[0]);
          eg.communicator.sendMessage(data.friend.id, "Skin set to " + args[0] + '.');
        }

        if(args[0].includes('EID_')){
            fortnite.party.me.setEmote("/Game/Athena/Items/Cosmetics/Dances/" + args[0] + "." + args[0]);
            eg.communicator.sendMessage(data.friend.id, "Emote set to " + args[0] + '.');
        }

        if(args[0].includes('BID_')){
          fortnite.party.me.setBackpack("/Game/Athena/Items/Cosmetics/Backpacks/" + args[0] + "." + args[0]);
          eg.communicator.sendMessage(data.friend.id, "Backpack set to " + args[0] + '.');
        }

        if(args[0].includes('PICKAXE_ID_')){
          fortnite.party.me.setBackpack("/Game/Athena/Items/Cosmetics/Pickaxes/" + args[0] + "." + args[0]);
          eg.communicator.sendMessage(data.friend.id, "Pickaxe set to " + args[0] + '.');
        }

        if(args[0] == '!skin') {
          var skinID = await BenBotRequest('Outfit', skinContent)
          fortnite.party.me.setOutfit("/Game/Athena/Items/Cosmetics/Characters/" + skinID + "." + skinID);
          eg.communicator.sendMessage(data.friend.id, "Skin set to " + skinID + '.');
        }

        if(args[0] == '!emote') {
          var emoteID = await BenBotRequest('Emote', emoteContent)
          fortnite.party.me.setEmote("/Game/Athena/Items/Cosmetics/Dances/" + emoteID + "." + emoteID);
          eg.communicator.sendMessage(data.friend.id, "Emote set to " + emoteID + '.');
        }

        if(args[0] == '!backpack') {
          var backpackID = await BenBotRequest('Back Bling', emoteContent)
          fortnite.party.me.setBackpack("/Game/Athena/Items/Cosmetics/Dances/" + backpackID + "." + backpackID);
          eg.communicator.sendMessage(data.friend.id, "Backpack set to " + backpackID + '.');
        }

        if(args[0] == '!pickaxe') {
          var pickaxeID = await BenBotRequest('Harvesting Tool', emoteContent)
          fortnite.party.me.setPickaxe("/Game/Athena/Items/Cosmetics/Dances/" + pickaxeID + "." + pickaxeID);
          eg.communicator.sendMessage(data.friend.id, "Pickaxe set to " + pickaxeID + '.');
        }

        if(args[0] == '!purpleskull') {
          const variants = [{"item":"AthenaCharacter","channel":"ClothingColor","variant":"Mat1"}];
    
          setOutfitVariants(fortnite.party.me, "/Game/Athena/Items/Cosmetics/Characters/CID_030_Athena_Commando_M_Halloween.CID_030_Athena_Commando_M_Halloween", undefined, variants)
          eg.communicator.sendMessage(data.friend.id, "Skin set to Purple Skull.");
        }     

        if(args[0] == '!pinkghoul') {
          const variants = [{"item":"AthenaCharacter","channel":"Material","variant":"Mat3"}];
    
          setOutfitVariants(fortnite.party.me, "/Game/Athena/Items/Cosmetics/Characters/CID_029_Athena_Commando_F_Halloween.CID_029_Athena_Commando_F_Halloween", undefined, variants)
          eg.communicator.sendMessage(data.friend.id, "Skin set to Pink Ghoul.");
        }

        if(args[0] == '!checkeredrenegade') {
          const variants = [{"item":"AthenaCharacter","channel":"Material","variant":"Mat2"}];
    
          setOutfitVariants(fortnite.party.me, "/Game/Athena/Items/Cosmetics/Characters/CID_028_Athena_Commando_F.CID_028_Athena_Commando_F", undefined, variants)
          eg.communicator.sendMessage(data.friend.id, "Skin set to Checkered Renegade.");
        }

        if(args[0] == '!variants') {
          const variants = [{"item":"AthenaCharacter","channel":args[2],"variant":args[3]}];
    
          setOutfitVariants(fortnite.party.me, "/Game/Athena/Items/Cosmetics/Characters/" + args[1] + "." + args[1], undefined, variants)
          eg.communicator.sendMessage(data.friend.id, "Skin set to " + args[1] + ".");
        } 

        });
      
      fortnite.communicator.updateStatus(config.status);
    });
