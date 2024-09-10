const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require("../../model/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('details')
        .setDescription('Retrieves your account info.'),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findOne({ discordId: interaction.user.id }).lean();
        if (!user) {
            return interaction.editReply({ content: "You do not have a registered account!", ephemeral: true });
        }

        let onlineStatus = global.Clients.some(i => i.accountId === user.accountId);

        const embed = new EmbedBuilder()
            .setColor("#56ff00")
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: "Created", value: `${new Date(user.created).toLocaleDateString()}`, inline: true },
                { name: "Online", value: onlineStatus ? "Yes" : "No", inline: true },
                { name: "Banned", value: user.banned ? "Yes" : "No", inline: true },
                { name: "Account ID", value: user.accountId, inline: true },
                { name: "Username", value: user.username, inline: true },
                { name: "Email", value: `||${user.email}||`, inline: true }
            )
            .setTimestamp();

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
};
