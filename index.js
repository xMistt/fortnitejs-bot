const { Client, Enums } = require('fnbr');
const { readFile, writeFile } = require('fs').promises;
const { get } = require('request-promise');

(async () => {
  const currentLibVersion = JSON.parse(await readFile(require.resolve('fnbr').replace('index.js', 'package.json'))).version;
  const latestVersion = (await get({ url: 'https://registry.npmjs.org/-/package/fnbr/dist-tags', json: true })).latest;
  if (currentLibVersion !== latestVersion) console.log('\x1b[31mWARNING: You\'re using an older version of the library. Please run installDependencies.bat\x1b[0m');
  let config;
  try {
    config = JSON.parse(await readFile('./config.json'));
  } catch (e) {
    await writeFile('./config.json', JSON.stringify({
      outfit: 'Renegade Raider',
      backpack: 'Black Shield',
      emote: 'The Renegade',
      pickaxe: 'AC/DC',
      banner: 'InfluencerBanner57',
      bannerColor: 'defaultcolor',
      level: 999,
      status: 'discord.gg/fnpy',
      friendaccept: true,
      inviteaccept: true,
      platform: 'WIN',
  }, null, 2));
    console.log('\x1b[31mWARNING: config.json was missing and created. Please fill it out\x1b[0m');
    return;
  }

  console.log('\x1b[36mfortnitejs-bot made by xMistt. Massive credit to This Nils and Alex for creating the library.');
  console.log('Discord server: https://discord.gg/fnpy - For support, questions, etc.\x1b[0m');

  process.stdout.write('\x1b[33mFetching cosmetics...\x1b[0m');
  let cosmetics;
  try {
    cosmetics = (await get({ url: 'https://fortnite-api.com/v2/cosmetics/br', json: true })).data;
  } catch (e) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log('\x1b[31mFailed fetching cosmetics!\x1b[0m');
    return;
  }
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log('\x1b[32mSuccessfully fetched cosmetics!\x1b[0m');

  const defaultCosmetics = {
    outfit: cosmetics.find((c) => c.name === config.outfit && c.type.value === 'outfit'),
    backpack: cosmetics.find((c) => c.name === config.backpack && c.type.value === 'backpack'),
    pickaxe: cosmetics.find((c) => c.name === config.pickaxe && c.type.value === 'pickaxe'),
    emote: cosmetics.find((c) => c.name === config.emote && c.type.value === 'emote'),
  };

  for (const key of Object.keys(defaultCosmetics)) {
    if (!defaultCosmetics[key]) {
      console.log(`\x1b[31mWARNING: ${key} in config wasn't found! Please check the spelling\x1b[0m`);
      return;
    }
  }

  const clientOptions = {
    status: config.status,
    platform: config.platform,
    cachePresences: false,
    kairos: {
      cid: defaultCosmetics.outfit.id,
      color: Enums.KairosColor.GRAY,
    },
    keepAliveInterval: 30,
    auth: {},
    debug: false,
  };

  try {
    clientOptions.auth.deviceAuth = JSON.parse(await readFile('./deviceAuth.json'));
  } catch (e) {
    clientOptions.auth.authorizationCode = async () => Client.consoleQuestion('Please enter an authorization code: ');
  }

  const client = new Client(clientOptions);
  client.on('deviceauth:created', (da) => writeFile('./deviceAuth.json', JSON.stringify(da, null, 2)));
  process.stdout.write('\x1b[33mBot starting...\x1b[0m');
  await client.login();
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(`\x1b[32mBot started as ${client.user.displayName}!\x1b[0m`);
  await client.party.me.setOutfit(defaultCosmetics.outfit.id);
  await client.party.me.setBackpack(defaultCosmetics.backpack.id);
  await client.party.me.setPickaxe(defaultCosmetics.pickaxe.id);
  await client.party.me.setLevel(config.level);
  await client.party.me.setBanner(config.banner, config.bannerColor);

  client.on('friend:request', (req) => {
    if (config.friendaccept) req.accept();
    else req.decline();
    console.log(`${config.friendaccept ? 'accepted' : 'declined'} friend request from: ${req.displayName}`);
  });

  client.on('party:invite', (inv) => {
    if (config.inviteaccept) inv.accept();
    else inv.decline();
    console.log(`${config.inviteaccept ? 'accepted' : 'declined'} party invite from: ${inv.sender.displayName}`);
  });

  client.on('party:member:joined', () => {
    client.party.me.setEmote(defaultCosmetics.emote.id);
  });
  
  const findCosmetic = (query, type) => {
    return cosmetics.find((c) => (c.id.toLowerCase() === query.toLowerCase()
      || c.name.toLowerCase() === query.toLowerCase()) && c.type.value === type);
  };

  const handleCommand = (message, sender) => {
    console.log(`${sender.displayName}: ${message.content}`);
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).split(' ');
    const command = args.shift().toLowerCase();
    const content = args.join(' ');

    if (command === 'skin') {
      const skin = findCosmetic(content, 'outfit');
      if (skin) client.party.me.setOutfit(skin.id);
      else message.reply(`Skin ${content} wasn't found!`);
    } else if (command === 'emote') {
      const emote = findCosmetic(content, 'emote');
      if (emote) client.party.me.setEmote(emote.id);
      else message.reply(`Emote ${content} wasn't found!`);
    } else if (command === 'pickaxe') {
      const pickaxe = findCosmetic(content, 'pickaxe');
      if (pickaxe) client.party.me.setPickaxe(pickaxe.id);
      else message.reply(`Pickaxe ${content} wasn't found!`);
    } else if (command === 'ready') {
      client.party.me.setReadiness(true);
    } else if (command === 'unready') {
      client.party.me.setReadiness(false);
    } else if (command === 'purpleskull') {
      client.party.me.setOutfit('CID_030_Athena_Commando_M_Halloween', [{ channel: 'ClothingColor', variant: 'Mat1' }]);
    } else if (command === 'pinkghoul') {
      client.party.me.setOutfit('CID_029_Athena_Commando_F_Halloween', [{ channel: 'Material', variant: 'Mat3' }]);
    } else if (command === 'level') {
      client.party.me.setLevel(parseInt(content, 10));
    }
  };

  client.on('friend:message', (m) => handleCommand(m, m.author));
  client.on('party:member:message', (m) => handleCommand(m, m.author));
})();
