const Discord = require('discord.js')
const config = require('../config.js')

exports.run = (client, message, args) => {
    if(message.author.id !== config.ownerID) return;
    const randomcolors = ['#000000', '#f4fc03']
    const colors = randomcolors[Math.floor(Math.random() * randomcolors.length)];
    const embed = new Discord.MessageEmbed()
    .setTitle('**RULES/INFO**')
    .setColor(colors)
    .addField('**RULES**', '**#1** No swearing\n**#2** No bullying\n**#3** Only use bot commands in <#830048103482392607>\n**#4** Dont ping the owner')
    .addField('**ROLE INFO**', '<@&830039261310877726> The one any only monkeydue\n<@&830040217637093407> Member **Permissions** Just chat and make friends\n<@&830039926649258004> The bots\n<@&830041003406655549> Just a admin **Permissions** administration\n<@&830040689592893440>  Moderation **Permissions** not alot')
    message.channel.send(embed)
}