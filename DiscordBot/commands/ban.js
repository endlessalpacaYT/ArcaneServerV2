const { SlashCommandBuilder } = require('discord.js');
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./Config/config.json").toString());

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the backend by their username.')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Target username.')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!config.moderators.includes(interaction.user.id)) {
            return interaction.editReply({ content: "You do not have moderator permissions.", ephemeral: true });
        }

        const username = interaction.options.getString('username');
        const targetUser = await User.findOne({ username_lower: username.toLowerCase() });

        if (!targetUser) {
            return interaction.editReply({ content: "The account username you entered does not exist.", ephemeral: true });
        } else if (targetUser.banned) {
            return interaction.editReply({ content: "This account is already banned.", ephemeral: true });
        }

        await targetUser.updateOne({ $set: { banned: true } });

        let refreshTokenIndex = global.refreshTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (refreshTokenIndex !== -1) global.refreshTokens.splice(refreshTokenIndex, 1);

        let accessTokenIndex = global.accessTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (accessTokenIndex !== -1) {
            global.accessTokens.splice(accessTokenIndex, 1);

            let xmppClient = global.Clients.find(client => client.accountId === targetUser.accountId);
            if (xmppClient) xmppClient.client.close();
        }

        if (accessTokenIndex !== -1 || refreshTokenIndex !== -1) functions.UpdateTokens();

        return interaction.editReply({ content: `Successfully banned ${targetUser.username}`, ephemeral: true });
    }
};
