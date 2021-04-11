const Discord = require('discord.js')
const randomcolors = ['#000000', '#f4fc03']
const colors = randomcolors[Math.floor(Math.random() * randomcolors.length)];

exports.run = (client, message, args) => {
    if (args.join(' ') === "fun") {
        const fun = new Discord.MessageEmbed()
        .setTitle("😀Fun Commands")
        .setDescription('``meme``')
        .setColor(colors)
        message.channel.send(fun)
    } else
    if (args.join(' ') === "mod") {
        const modcms = new Discord.MessageEmbed()
        .setTitle("🔒Moderation Commands")
        .setDescription('``kick``')
        .setColor(colors)
        message.channel.send(modcms)
    }
else {
    const help = new Discord.MessageEmbed()
    .setTitle('Welcome to the help menu')
    .setDescription('hi welcome to the help menu')
    .addField('😀Fun', '!help fun', true)
    .addField('🔒Moderation', '!help mod', true)
    .setColor(colors)
    message.channel.send(help)
    }
}