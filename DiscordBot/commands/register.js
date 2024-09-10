const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require("../../structs/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers your account on Arcane.')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Your username.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('email')
                .setDescription('Your email.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('password')
                .setDescription('Your password.')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordId = interaction.user.id;
        const email = interaction.options.getString('email');
        const username = interaction.options.getString('username');
        const password = interaction.options.getString('password');

        try {
            const resp = await functions.registerUser(discordId, username, email, password);

            const embed = new EmbedBuilder()
                .setColor(resp.status >= 400 ? "#ff0000" : "#56ff00") 
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: 'Message', value: resp.message }
                )
                .setTimestamp();

            if (resp.status >= 400) {
                return interaction.editReply({ embeds: [embed], ephemeral: true });
            }
            if (interaction.channel) {
                await interaction.channel.send({ embeds: [embed] });
            } else {
                await interaction.user.send({ embeds: [embed] });
            }

            return interaction.editReply({ content: "You successfully created an account!", ephemeral: true });
        } catch (error) {
            console.error('Error during registration:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: 'Message', value: 'An unexpected error occurred during registration.' }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
