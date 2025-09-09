import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "baileys";
import pino from "pino";
import QRCode from "qrcode";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(await QRCode.toString(qr, { type: "terminal", small: true }));
    }

    if (connection === "open") {
      console.log("✅ Bot conectado ao WhatsApp");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("⚡ Reconectando...");
        startBot();
      } else {
        console.log("❌ Logout detectado, escaneie o QR Code novamente");
      }
    }

    // Se estiver conectando ou QR presente, opcional: gerar código de pareamento
    // if (connection === "connecting" || !!qr) {
    //   const code = await sock.requestPairingCode(phoneNumber);
    //   console.log("Código de pareamento:", code);
    // }
  });
}

startBot();
