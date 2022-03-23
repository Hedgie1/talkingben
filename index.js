const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');

const bot = new Client(
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_VOICE_STATES
        ],

        partials: [
            'MESSAGE',
            'CHANNEL',
            'REACTION'
        ],
    }
);

const voice = require('@discordjs/voice');
const path = require('path');
const config = require('./config.json')

process.on('uncaughtException', (error) => { console.log(error) });

bot.once('ready', async () => {


    console.log(`${bot.user.tag} is ready to operate in ${bot.guilds.cache.size} servers!`)
    bot.user.setActivity(config.status, { type: config.statusType });

    const commands = bot.application?.commands

    commands.create({
        name: 'join',
        description: 'Ben will join your voice channel!'
    })

    commands.create({
        name: 'beans',
        description: 'Give Ben some fresh beans!'
    })

    commands.create({
        name: 'drink',
        description: "Ben needs to drink. Give him a bo'oh'wa'er!"
    })

    commands.create({
        name: 'soundboard',
        description: 'Use soundboard for playing Ben\'s sound effects!'
    })

    commands.create({
        name: 'leave',
        description: 'Ben will leave your voice channel!'
    })

    commands.create({
        name: 'help',
        description: "View Ben's Help menu!"
    })

    commands.create({
        name: 'ask',
        description: 'Ask Ben something!',
        options: [
            {
                name: 'question',
                description: 'Ask Ben a question.',
                type: 3,
                required: true
            },
        ]
    })

})



bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }

    const { commandName } = interaction


    if (commandName === 'beans') {

        let embed = new Discord.MessageEmbed()
            .setTitle("You gave Ben some beans!")
            .setImage("https://c.tenor.com/UZOcqAyMu4QAAAAd/talking-ben-eating.gif")
            .setColor("DARK_ORANGE")

        interaction.reply({
            embeds: [embed]
        })
    }

    if (commandName === 'drink') {

        let embed = new Discord.MessageEmbed()
            .setTitle("You gave Ben a drink!")
            .setImage("https://c.tenor.com/hdPVLfpe81cAAAAC/talking-ben-drinking.gif")
            .setColor("DARK_ORANGE")

        interaction.reply({
            embeds: [embed]
        })
    }


    if (commandName === 'join') {

        if (interaction.member == null) return interaction.reply
            ({ content: '❌ Error has occured.', ephemeral: true })

        if (interaction.member.voice.channel == null) return interaction.reply
            ({ content: "**You must be in a voice channel!**", ephemeral: true });


        const player = voice.createAudioPlayer();
        const resource = voice.createAudioResource(path.join(__dirname, 'sounds', 'ben.mp3'))


        const connection = voice.joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        connection.subscribe(player)
        player.play(resource)

        let embed = new Discord.MessageEmbed()
            .setTitle("I joined your voice channel!")
            .setDescription("I joined <#" + interaction.member.voice.channel.id + ">. Have fun!")
            .setColor("YELLOW")
            .setTimestamp()

        interaction.reply({
            embeds: [embed]
        })
    }

    if (commandName === 'help') {

        let embed = new Discord.MessageEmbed()
            .setTitle("Ben's Help Menu")
            .addField("/join", "Ben joins your voice channel.", true)
            .addField("/leave", "Ben leaves your voice channel.", true)
            .addField("/ask", "You can ask Ben a question!", true)
            .addField("/beans", "Give Ben some beans!", true)
            .addField("/drink", "Give Ben a drink!", true)
            .setColor("YELLOW")

        interaction.reply({ embeds: [embed] })
    }

    if (commandName === 'soundboard') {

        if (interaction.member == null) return interaction.reply
            ({ content: '❌ Error has occured.', ephemeral: true })

        if (interaction.member.voice.channel == null) return interaction.reply
            ({ content: "**You must be in a voice channel!**", ephemeral: true });

        const connection = voice.joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        let embed = new Discord.MessageEmbed()
            .setTitle("Ben's Soundboard")
            .setDescription("Use buttons to play various sounds!")
            .setColor("LUMINOUS_VIVID_PINK")

        let yes = new Discord.MessageButton()
            .setLabel("Yes")
            .setCustomId('yes')
            .setStyle("SUCCESS")

        let no = new Discord.MessageButton()
            .setLabel("No")
            .setCustomId('no')
            .setStyle("DANGER")

        let ben = new Discord.MessageButton()
            .setLabel("Ben")
            .setCustomId('ben')
            .setStyle("PRIMARY")

        let laugh = new Discord.MessageButton()
            .setLabel("Laugh")
            .setCustomId('laugh')
            .setStyle("SECONDARY")

        let ugh = new Discord.MessageButton()
            .setLabel("Ugh")
            .setCustomId('ugh')
            .setStyle("DANGER")

        let hang = new Discord.MessageButton()
            .setLabel("Hang up")
            .setCustomId('hang')
            .setStyle("SUCCESS")

        let burp = new Discord.MessageButton()
            .setLabel("Burp")
            .setCustomId('burp')
            .setStyle("PRIMARY")

        let drink = new Discord.MessageButton()
            .setLabel("Drink")
            .setCustomId('drink')
            .setStyle("SECONDARY")

        let beans = new Discord.MessageButton()
            .setLabel("Eat")
            .setCustomId('beans')
            .setStyle("DANGER")

        let row = new Discord.MessageActionRow()
            .addComponents(yes, no, laugh, ugh, hang)

        let row2 = new Discord.MessageActionRow()
            .addComponents(burp, drink, beans, ben)

        interaction.reply({
            embeds: [embed],
            components: [row, row2]
        })

        const message = await interaction.fetchReply()
        const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id === interaction.user.id) {
                let c = i.customId
                if (c == 'yes' || c == 'no' || c == 'laugh' || c == 'ugh' || c == 'hang' || c == 'burp' || c == 'drink' || c == 'beans' || c == 'ben') {

                    collector.resetTimer()

                    const connection = voice.getVoiceConnection(interaction.guild.id)

                    if (connection == null) return i.reply({
                        content: "**I'm not in a voice channel anymore!**",
                        ephemeral: true
                    })

                    i.deferUpdate()
                    const player = voice.createAudioPlayer();
                    const resource = voice.createAudioResource(path.join(__dirname, 'sounds', c + '.mp3'))

                    connection.subscribe(player)
                    player.play(resource)
                }


            } else {
                i.reply({ content: '❌ **Not your soundboard!**', ephemeral: true })
            }
        });

        collector.on('end', () => {
            interaction.editReply({
                components: [],
                embeds: [embed.setFooter("This soundboard has expired, you can generate a new one.")]
            }).catch(() => { })
        });


    }

    if (commandName === 'leave') {
        const connection = voice.getVoiceConnection(interaction.guild.id)

        if (connection == null) return interaction.reply({
            content: "**I'm not in a voice channel!**",
            ephemeral: true
        })

        interaction.deferReply()
        const player = voice.createAudioPlayer();

        const resource = voice.createAudioResource(path.join(__dirname, 'sounds', 'hang.mp3'))

        connection.subscribe(player)
        player.play(resource)

        setTimeout(function () {
            try {
                connection.destroy()
            } catch {
                () => { }
            }

            interaction.editReply({
                content: '*hangs up*',
                ephemeral: true
            })
        }, 3000);

    }


    if (commandName === 'ask') {

        if (interaction.member == null) return interaction.reply
            ({ content: '❌ Error has occured.', ephemeral: true })

        if (interaction.member.voice.channel == null) return interaction.reply
            ({ content: "**You must be in a voice channel!**", ephemeral: true });

        let question = interaction.options.getString("question")
        let num = Math.floor(Math.random() * 4)
        let sounds; let answer

        if (num == 0)
            sounds = 'yes.mp3',
                answer = 'Yes';

        if (num == 1)
            sounds = 'laugh.mp3',
                answer = 'Ho ho ho...';

        if (num == 2)
            sounds = 'no.mp3',
                answer = '**No.**';

        if (num == 3)
            sounds = 'ugh.mp3',
                answer = 'Ugh.'

        const player = voice.createAudioPlayer();
        const resource = voice.createAudioResource(path.join(__dirname, 'sounds', sounds))

        const connection = voice.joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        connection.subscribe(player)
        player.play(resource)

        let embed = new Discord.MessageEmbed()
            .setTitle("You asked Ben a question..")
            .addField("Question", question, true)
            .addField("Answer", answer, true)
            .setColor("YELLOW")

        interaction.reply({ embeds: [embed] })
    }
});


bot.login(config.token)
