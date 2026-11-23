import type { Locale } from "../i18n.tsx";

// Política de privacidad del sello. BORRADOR: Jaime debe revisarla antes de publicar.
// Lo que aún no está confirmado va marcado con «PENDIENTE» y se muestra así en la página.

export interface PrivacySection {
  title: string;
  paragraphs: string[];
}

export interface PrivacyContent {
  title: string;
  draft: string;
  updated: string;
  sections: PrivacySection[];
}

const es: PrivacyContent = {
  title: "Privacidad",
  draft: "Borrador pendiente de revisión.",
  updated: "Última actualización: PENDIENTE",
  sections: [
    {
      title: "Quién es el responsable",
      paragraphs: [
        "Jaime Tapiador, a título personal, como autor de este demostrador. Contacto para cuestiones de privacidad: PENDIENTE.",
      ],
    },
    {
      title: "Lo que no recogemos",
      paragraphs: [
        "Tus documentos no salen de tu equipo: la huella se calcula en tu navegador y solo se envía la huella cuando decides sellar. No guardamos el fichero ni su nombre.",
        "No usamos cookies de analítica ni de publicidad. Para comprobar un documento no hace falta cuenta y no se guarda ningún dato tuyo.",
      ],
    },
    {
      title: "Lo que recogemos si creas una cuenta",
      paragraphs: [
        "Para sellar hace falta una cuenta. Guardamos tu correo electrónico y un identificador interno. Si entras con Google, Google nos facilita tu correo y, según tu configuración, tu nombre y tu foto de perfil. Si usas contraseña, la gestiona Firebase Authentication y nosotros no la vemos.",
        "Por cada documento que sellas desde esta web guardamos la huella, la transacción, la red y la fecha, asociadas a tu identificador, para mostrarte «Tus sellos». También llevamos un contador de sellos por día para aplicar el límite de uso.",
        "Los registros técnicos de las funciones guardan tu identificador interno, la huella y la transacción de cada sello, para diagnosticar errores y abusos.",
        "Tu navegador guarda la sesión (almacenamiento local de Firebase Authentication) para que no tengas que entrar cada vez. Es imprescindible para el servicio y no se usa para nada más.",
      ],
    },
    {
      title: "Para qué y con qué base",
      paragraphs: [
        "Para gestionar tu cuenta, permitirte sellar, mostrarte tus sellos y limitar el uso automatizado. Base jurídica: PENDIENTE (propuesta: prestación del servicio que solicitas al crear la cuenta, art. 6.1.b del RGPD).",
      ],
    },
    {
      title: "Quién trata los datos por nosotros",
      paragraphs: [
        "Google (Firebase Authentication, Cloud Functions y Firestore), como encargado del tratamiento. Firestore y las funciones están en la Unión Europea (multirregión europea y Bélgica). Ubicación de los datos de Firebase Authentication: PENDIENTE de verificar.",
        "Si entras con Google, el inicio de sesión ocurre en las páginas de Google y se rige también por su política de privacidad.",
      ],
    },
    {
      title: "Lo que queda en la cadena de bloques",
      paragraphs: [
        "Cada sello deja en la red pública Base Sepolia la huella del documento, la fecha y la cuenta de la demo que lo envía. No incluye tu correo ni tu identificador. Es público y no se puede borrar, ni por ti ni por nosotros.",
        "Una huella no permite reconstruir el documento, pero quien tenga el mismo documento puede comprobar que se selló. Por eso pedimos que no selles documentos con datos personales.",
      ],
    },
    {
      title: "Cuánto tiempo",
      paragraphs: [
        "Tu cuenta y la relación con tus sellos, hasta que borres la cuenta. El contador diario se sobrescribe cada día. Los registros técnicos, durante el plazo de retención de Google Cloud: PENDIENTE de confirmar.",
      ],
    },
    {
      title: "Tus derechos",
      paragraphs: [
        "Puedes borrar tu cuenta en cualquier momento desde «Tus sellos»: se eliminan la cuenta y la relación entre tu cuenta y tus sellos. Para ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, escribe al contacto indicado arriba (PENDIENTE).",
        "Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
      ],
    },
  ],
};

const en: PrivacyContent = {
  title: "Privacy",
  draft: "Draft pending review.",
  updated: "Last updated: PENDING",
  sections: [
    {
      title: "Who is responsible",
      paragraphs: [
        "Jaime Tapiador, in a personal capacity, as the author of this demo. Privacy contact: PENDING.",
      ],
    },
    {
      title: "What we do not collect",
      paragraphs: [
        "Your documents never leave your device: the fingerprint is computed in your browser and only the fingerprint is sent when you decide to seal. We do not keep the file or its name.",
        "We use no analytics or advertising cookies. Checking a document needs no account and stores no data about you.",
      ],
    },
    {
      title: "What we collect if you create an account",
      paragraphs: [
        "Sealing requires an account. We keep your email address and an internal identifier. If you sign in with Google, Google gives us your email and, depending on your settings, your name and profile picture. If you use a password, Firebase Authentication manages it and we never see it.",
        "For each document you seal from this website we keep the fingerprint, transaction, network and date, linked to your identifier, to show you “Your seals”. We also keep a daily seal counter to apply the usage limit.",
        "The functions' technical logs record your internal identifier, the fingerprint and the transaction of each seal, to diagnose errors and abuse.",
        "Your browser keeps the session (Firebase Authentication local storage) so you do not have to sign in every time. It is essential for the service and used for nothing else.",
      ],
    },
    {
      title: "Purpose and legal basis",
      paragraphs: [
        "To manage your account, let you seal, show you your seals and limit automated use. Legal basis: PENDING (proposal: providing the service you request when creating the account, Art. 6(1)(b) GDPR).",
      ],
    },
    {
      title: "Who processes data on our behalf",
      paragraphs: [
        "Google (Firebase Authentication, Cloud Functions and Firestore), as data processor. Firestore and the functions are in the European Union (European multi-region and Belgium). Location of Firebase Authentication data: PENDING verification.",
        "If you sign in with Google, sign-in happens on Google's pages and is also governed by Google's privacy policy.",
      ],
    },
    {
      title: "What stays on the blockchain",
      paragraphs: [
        "Each seal leaves on the public Base Sepolia network the document's fingerprint, the date and the demo account that sent it. It does not include your email or identifier. It is public and cannot be deleted, by you or by us.",
        "A fingerprint does not allow anyone to rebuild the document, but anyone who has the same document can check that it was sealed. That is why we ask you not to seal documents containing personal data.",
      ],
    },
    {
      title: "How long",
      paragraphs: [
        "Your account and the link to your seals, until you delete the account. The daily counter is overwritten every day. Technical logs, for Google Cloud's retention period: PENDING confirmation.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: [
        "You can delete your account at any time from “Your seals”: the account and the link between your account and your seals are removed. To exercise your rights of access, rectification, erasure, objection, restriction and portability, write to the contact above (PENDING).",
        "If you think we have not handled your request properly, you can complain to the Spanish Data Protection Agency (aepd.es).",
      ],
    },
  ],
};

export const PRIVACY: Record<Locale, PrivacyContent> = { es, en };
