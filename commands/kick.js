const Discord = require('discord.js')
exports.run = async (client, message, args) => {
    let member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);
    let reason = args.slice(1).join(' ');
  
    let embed = new Discord.MessageEmbed()
      .setColor('#eeff00')
      .setFooter(`Bot is maintained by  BLADEZ#7296`);
  
    if (!message.member.hasPermission('MANAGE_ROLES')) {
      embed
        .setTitle(`You Do Not Have The Permissions For This Command!`)
        .setDescription(`<@!${message.member.user.id}> you are not an Admin`);
  
      return message.channel.send(embed);
    }
  
    // are you sure you want to check if member exists?
    // if (member) should be if (!member)
    if (!member) {
      embed
        .setTitle(`InValid User`)
        .setDescription(
          `<@!${message.member.user.id}> please give a valid User \n **Remember** !kick [@User] [reason]`,
        );
      return message.channel.send(embed);
    }
  
    if (member.roles.highest.position > message.member.roles.highest.position) {
      embed
        .setTitle(`Kick Unsuccessful`)
        .setDescription(
          `<@!${message.member.user.id}> you can not kick this person!`,
        );
      return message.channel.send(embed);
    }
  
    embed
      .setTitle(`Kick Successful`)
      .setDescription(
        `**<@!${member.user.id}>** has been **kicked** for **${reason}** by **<@!${message.author.id}>**`,
      );
  
    if (!reason) {
      reason = 'No reason given';
    }
  
    member.kick(reason);
    message.channel.send(embed);
    console.log(
      `**${member.user.tag}** has been kicked for ${reason} by ${message.author.tag}`,
    );
  };