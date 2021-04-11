const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const AntiSpam = require('discord-anti-spam');
const antiSwearWords = require("anti-swear-words-packages-discord")



const client = new Discord.Client();
client.config = require("./config.js");
client.db = require("quick.db");
client.request = new (require("rss-parser"))();



client.on("ready", () => {
  console.log("I'm ready!");
  handleUploads();
});



function handleUploads() {
  if (client.db.fetch(`postedVideos`) === null) client.db.set(`postedVideos`, []);
  setInterval(() => {
    client.request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${client.config.channel_id}`)
      .then(data => {
        if (client.db.fetch(`postedVideos`).includes(data.items[0].link)) return;
        else {
          client.db.set(`videoData`, data.items[0]);
          client.db.push("postedVideos", data.items[0].link);
          let parsed = client.db.fetch(`videoData`);
          let channel = client.channels.cache.get(client.config.channel);
          if (!channel) return;
          let message = client.config.messageTemplate
            .replace(/{author}/g, parsed.author)
            .replace(/{title}/g, Discord.Util.escapeMarkdown(parsed.title))
            .replace(/{url}/g, parsed.link);
          channel.send(message);
        }
      });
  }, client.config.watchInterval);
}


client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});


client.on("message", (message) => {
  if (message.author.bot) return;

  if (message.content.indexOf(client.config.prefix) !== 0) return;

  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(command);
  if (!cmd) return;
  cmd.run(client, message, args);

});

client.on("messageDelete", async message => {
  const logchannel = message.guild.channels.cache.find(ch => ch.name === "logs")
  if (!logchannel) return

  const embed = new Discord.MessageEmbed()
    .setTitle("Message Deleted | " + message.author.tag)
    .addField('Deleted', message)
    .addField("Deleted in", message.channel)

  logchannel.send(embed)
})

client.on('message', async message => {
  antiSwearWords(client, message, {
    warnMSG: `<@${message.author.id}> , why are you writing this?`,
    ignoreWord: ["ignoreThis", "andIgnoreThis", "alsoIgnoreThis"],
    customWord: ["aCustomWord", "anOtherCustomWord"],
    muteRole: "830070235453194290",
    muteCount: 10,
    kickCount: 20,
    banCount: 30,
  });
});

const antiSpam = new AntiSpam({
  warnThreshold: 3,
  muteThreshold: 4,
  kickThreshold: 7,
  banThreshold: 7,
  maxInterval: 2000,
  warnMessage: '{@user}, Please stop spamming.',
  kickMessage: '**{user_tag}** has been kicked for spamming.',
  muteMessage: '**{user_tag}** has been muted for spamming.',
  banMessage: '**{user_tag}** has been banned for spamming.',
  maxDuplicatesWarning: 6,
  maxDuplicatesKick: 10,
  maxDuplicatesBan: 12,
  maxDuplicatesMute: 8,
  ignoredPermissions: ['ADMINISTRATOR'],
  ignoreBots: true,
  verbose: true,
  ignoredMembers: [],
  muteRoleName: "Muted",
  removeMessages: true
});
client.on('message', (message) => antiSpam.message(message));

client.on('guildMemberAdd', member => {
  member.roles.add(member.guild.roles.cache.find(i => i.name === 'Fans'))

  const welcomeEmbed = new Discord.MessageEmbed()

  welcomeEmbed.setColor('#5cf000')
  welcomeEmbed.setTitle('**' + member.user.username + '** is now Among Us other **' + member.guild.memberCount + '** people')
  welcomeEmbed.setImage('https://cdn.mos.cms.futurecdn.net/93GAa4wm3z4HbenzLbxWeQ-650-80.jpg.webp')

  member.guild.channels.cache.find(i => i.name === 'joins-leave').send(welcomeEmbed)
})

client.on('guildMemberRemove', member => {
  const goodbyeEmbed = new Discord.MessageEmbed()

  goodbyeEmbed.setColor('#f00000')
  goodbyeEmbed.setTitle('**' + member.user.username + '** was not the impostor there are **' + member.guild.memberCount + '** left Among Us')
  goodbyeEmbed.setImage('https://gamewith-en.akamaized.net/article/thumbnail/rectangle/22183.png')

  member.guild.channels.cache.find(i => i.name === 'joins-leave').send(goodbyeEmbed)
})

client.on("messageUpdate", async message => {
  const logchannel = message.guild.channels.cache.find(ch => ch.name === "logs")
  if (!logchannel) return

  const embed = new Discord.MessageEmbed()
    .setTitle("Edited Messages" + message.author.tag)
    .addField('Messages Before Edited', message)
    .addField("In channel", message.channel)

  logchannel.send(embed)
})

client.on('guildMemberAdd', member => {
  console.log('User @' + member.user.tag + ' has joined the server!');
  var role = member.guild.roles.cache.find(role => role.name == "Fans")
  member.addRole(role);
});

let userApplications = {}
client.on("message", function(message) {
  if (message.author.equals(client.user)) return;

  let authorId = message.author.id;

  if (message.content === "!apply") {
    console.log(`Apply begin for authorId ${authorId}`);
    if (!(authorId in userApplications)) {
      userApplications[authorId] = { "step": 1 }

      message.author.send("```We need to ask some questions so  we can know a litte bit about yourself```");
      message.author.send("```Application Started - Type '#Cancel' to cancel the application```");
      message.author.send("```Question 1: How many servers you corrently work in?```");
    }

  } else {

    if (message.channel.type === "dm" && authorId in userApplications) {
      let authorApplication = userApplications[authorId];

      if (authorApplication.step == 1) {
        authorApplication.answer1 = message.content;
        message.author.send("```Question 2: Age?```");
        authorApplication.step++;
      }
      else if (authorApplication.step == 2) {
        authorApplication.answer2 = message.content;
        message.author.send("```Question 3: Timezone? NA, AU, EU, NZ, or Other? (If other, describe your timezone)```");
        authorApplication.step++;
      }
      else if (authorApplication.step == 3) {
        authorApplication.answer3 = message.content;
        message.author.send("```Question 4: Do you have a youtube channel?```");
        authorApplication.step++;
      }

      else if (authorApplication.step == 4) {
        authorApplication.answer4 = message.content;
        message.author.send("```Thanks for your applying. Type !apply to apply again```");
        client.channels.cache.get("830180294081511484")
          .send(`${message.author.tag}\nQ.1 How many servers you corrently work in\n${authorApplication.answer1}\nQ.2 age\n${authorApplication.answer2}\nQ.3 timezone\n${authorApplication.answer3}\nQ.4 do you have a yt channel\n${authorApplication.answer4}`);
        delete userApplications[authorId];
      }
    }
  }
});

client.on("message", message => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.content === "i like pancakes they are very nice i eat them every day" && message.channel.id === "CHANNEL ID") {
    if (!message.channel.permissionsFor(message.guild.me).serialize().SEND_MESSAGES) return console.error("The bot doesn't have the permission to send messages.\nRequired permission: SEND_MESSAGES");
    if (!message.channel.permissionsFor(message.guild.me).serialize().ADD_REACTIONS) {
      console.error("The bot doesn't have the permission to add reactions.\nRequired permission: `ADD_REACTIONS`");
      message.channel.send("The bot doesn't have the permission to add reactions.\nRequired permission: `ADD_REACTIONS`")
        .then(m => m.delete({timeout: 20000}));
      return;
    }
    if (!message.channel.permissionsFor(message.guild.me).serialize().MANAGE_MESSAGES) {
      console.error("The bot doesn't have the permission to delete messages.\nRequired permission: `MANAGE_MESSAGES`");
      message.channel.send("The bot doesn't have the permission to delete messages.\nRequired permission: `MANAGE_MESSAGES`")
        .then(m => m.delete({timeout: 20000}));
      return;
    }
    const messageRole = message.guild.roles.cache.find(role => role.name === "Verified");
    if (messageRole == null) return;
    if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
      message.channel.send("The bot doesn't have the permission required to assign roles.\nRequired permission: `MANAGE_ROLES`")
        .then(m => m.delete({timeout: 20000}));
      return;
    }
    if (message.guild.me.roles.highest.comparePositionTo(messageRole) < 1) {
      message.channel.send("The position of this role is higher than the bot's highest role, it cannot be assigned by the bot.")
        .then(m => m.delete({timeout: 20000}));
      return;
    }
    if (messageRole.managed == true) {
      message.channel.send("This is an auto managed role, it cannot be assigned.")
        .then(m => m.delete({timeout: 20000}));
      return;
    }
    if (message.member.roles.cache.has(messageRole.id)) return;
    message.react("✅");
    message.member.roles.add(messageRole)
      .then(() => message.delete({ timeout:5000 }))
      .catch(error => {
      console.error(error.stack);
      message.channel.send(error.stack)
        .then(m => m.delete({timeout: 20000}));
    });
  }
});

client.login(client.config.token);