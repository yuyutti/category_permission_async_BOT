const { Client, Intents, } = require('discord.js');
require('dotenv').config();

const client = new Client({
intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
],
});

const token = process.env.TOKEN;
const categoryId = process.env.categoryId;
const targetRoleId = process.env.rollId;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!createVCs') { // 任意のトリガーコマンドを設定
        const guild = message.guild;

        // カテゴリを取得
        const category = guild.channels.cache.get(categoryId);

        // ロールを取得
        const role = guild.roles.cache.get(targetRoleId);

        // 1から49までのチャンネルを作成
        for (let i = 1; i <= 50; i++) {
            const channelName = `VC ${i}`;
            
            // チャンネルを作成
            const channel = await guild.channels.create(channelName, {
                type: 'GUILD_VOICE',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone, // @everyone ロールに対する権限設定
                        deny: ['VIEW_CHANNEL'], // チャンネルの表示権限を拒否
                    },
                    {
                        id: role.id, // ターゲットのロールに対する権限設定
                        allow: ['VIEW_CHANNEL', 'CONNECT'], // チャンネルの表示と接続権限を許可
                    },
                ],
                parent: category, // カテゴリに所属させる
                maxParticipants: 2, // 最大接続人数を2に制限
            });
        }

        // メッセージに応答
        message.reply('プライベートVCチャンネルが作成されました！');
    }
});

client.on('messageCreate', async (message) => {
    if (message.content === '!d' && message.guild) {
    const category = message.guild.channels.cache.get(categoryId);
    
    if (category && category.type === 'GUILD_CATEGORY') {
        category.children.forEach((channel) => {
        channel.delete()
            .then(() => console.log(`Deleted channel ${channel.name}`))
            .catch((error) => console.error(`Error deleting channel ${channel.name}: ${error}`));
        });
    } else {
        console.error('Category not found or invalid category ID');
    }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!set') {
    const category = message.guild.channels.cache.get(categoryId);
    
    if (category && category.type === 'GUILD_CATEGORY') {
        const voiceChannels = category.children.filter(channel => channel.type === 'GUILD_VOICE');
        
        if (voiceChannels.size === 0) {
        message.reply('カテゴリー内にボイスチャンネルがありません。');
        return;
        }
        
        voiceChannels.forEach(async voiceChannel => {
        await voiceChannel.edit({
            userLimit: 4
        });
        console.log(`ボイスチャンネル ${voiceChannel.name} の人数制限を2人に設定しました。`);
        });
    } else {
        message.reply(`指定されたカテゴリーは存在しないかカテゴリーではありません。`);
    }
    }
});

client.login(token);
