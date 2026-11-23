import type { Locale } from "../i18n.tsx";

// Política de privacidad del sello. Revisada con Jaime el 23/11/2026.
// «PENDIENTE»/«PENDING» se muestran con la marca visual de dato sin confirmar.
// Si cambia el tratamiento (nuevos datos, proveedores o plazos), hay que actualizar este texto y la fecha.

/** Correo de contacto para privacidad. */
export const PRIVACY_CONTACT = "jaime@tapiador.eu";

export interface PrivacySection {
  title: string;
  paragraphs: string[];
}

export interface PrivacyContent {
  title: string;
  updated: string;
  intro: string;
  sections: PrivacySection[];
}

const es: PrivacyContent = {
  title: "Privacidad",
  updated: "Última actualización: 23 de noviembre de 2026",
  intro:
    "Este demostrador está diseñado para tratar los menos datos posibles: comprobar un documento no requiere cuenta y tu documento nunca sale de tu equipo. Aquí se explica qué datos se tratan cuando creas una cuenta para sellar.",
  sections: [
    {
      title: "Responsable",
      paragraphs: [
        `Jaime Tapiador, a título personal, como autor de este demostrador sin ánimo de lucro. Contacto para cualquier cuestión de privacidad: ${PRIVACY_CONTACT}.`,
      ],
    },
    {
      title: "Lo que no recogemos",
      paragraphs: [
        "Tus documentos no salen de tu equipo: la huella se calcula en tu navegador y solo se envía la huella cuando decides sellar. No guardamos el fichero ni su nombre.",
        "No usamos cookies de analítica, de publicidad ni de seguimiento. Para comprobar un documento no hace falta cuenta y no se guarda ningún dato tuyo.",
      ],
    },
    {
      title: "Lo que recogemos si creas una cuenta",
      paragraphs: [
        "Datos de la cuenta: tu correo electrónico y un identificador interno. Si entras con Google, Google nos facilita además tu nombre y tu foto de perfil, que no usamos ni mostramos. Si usas contraseña, la gestiona Firebase Authentication de forma cifrada y nunca la vemos.",
        "Datos de uso: por cada documento que sellas desde esta web guardamos la huella, la transacción, la red y la fecha, asociadas a tu identificador, para mostrarte «Tus sellos». También llevamos un contador de sellos por día para aplicar el límite de uso.",
        "Datos técnicos: Firebase Authentication registra la dirección IP y el navegador al iniciar sesión, por seguridad. Los registros de nuestras funciones guardan tu identificador interno, la huella y la transacción de cada sello, para diagnosticar errores y abusos.",
        "Almacenamiento en tu navegador: se guarda la sesión de Firebase Authentication para que no tengas que entrar cada vez. Es imprescindible para el servicio, no es una cookie de seguimiento y desaparece al cerrar la sesión.",
      ],
    },
    {
      title: "Para qué y con qué base jurídica",
      paragraphs: [
        "Para crear y gestionar tu cuenta, permitirte sellar documentos, mostrarte tus sellos y limitar el uso automatizado del servicio. No usamos los datos para nada más: ni publicidad, ni perfiles, ni decisiones automatizadas, y no los cedemos a terceros.",
        "La base jurídica es la prestación del servicio que solicitas al crear la cuenta (artículo 6.1.b del RGPD). Los registros técnicos para seguridad y prevención de abusos se basan en el interés legítimo en mantener el servicio disponible y seguro (artículo 6.1.f del RGPD).",
      ],
    },
    {
      title: "Quién trata los datos por nosotros",
      paragraphs: [
        "Google, como encargado del tratamiento, a través de Firebase Authentication, Cloud Functions y Firestore, con las cláusulas de protección de datos de Google Cloud y Firebase.",
        "Firestore y las funciones están en la Unión Europea (multirregión europea y Bélgica). Firebase Authentication no permite elegir región, por lo que Google puede tratar los datos de las cuentas fuera de la Unión Europea, principalmente en Estados Unidos. Esas transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU., al que Google está adherido, y en las cláusulas contractuales tipo de la Comisión Europea.",
        "Si entras con Google, el inicio de sesión ocurre en las páginas de Google y se rige también por su propia política de privacidad.",
      ],
    },
    {
      title: "Lo que queda en la cadena de bloques",
      paragraphs: [
        "Cada sello deja en la red pública Base Sepolia la huella del documento, la fecha y la cuenta de la demo que lo envía. No incluye tu correo ni tu identificador. Es público, cualquiera puede consultarlo y no se puede borrar, ni por ti ni por nosotros.",
        "Una huella no permite reconstruir el documento, pero quien tenga el mismo documento puede comprobar que se selló. Por eso te pedimos que no selles documentos que contengan datos personales.",
      ],
    },
    {
      title: "Cuánto tiempo conservamos los datos",
      paragraphs: [
        "La cuenta y la relación con tus sellos, hasta que borres la cuenta. Al borrarla se eliminan en el momento de nuestra base de datos; Google los elimina de sus copias de seguridad en un máximo de 180 días.",
        "El contador diario se sobrescribe cada día. Los registros de nuestras funciones se conservan 30 días. Las direcciones IP que registra Firebase Authentication, unas pocas semanas.",
      ],
    },
    {
      title: "Tus derechos",
      paragraphs: [
        "Puedes borrar tu cuenta en cualquier momento desde «Tus sellos»: se eliminan la cuenta y la relación entre tu cuenta y tus sellos.",
        `Además, puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${PRIVACY_CONTACT}. Te responderemos en el plazo de un mes.`,
        "Si consideras que no hemos atendido bien tu solicitud, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (aepd.es).",
      ],
    },
    {
      title: "Cambios",
      paragraphs: [
        "Si cambia la forma de tratar los datos, actualizaremos esta página y su fecha. Si el cambio es relevante, lo avisaremos en la propia web.",
      ],
    },
  ],
};

const en: PrivacyContent = {
  title: "Privacy",
  updated: "Last updated: 23 November 2026",
  intro:
    "This demo is designed to process as little data as possible: checking a document needs no account and your document never leaves your device. This page explains what data is processed when you create an account to seal.",
  sections: [
    {
      title: "Controller",
      paragraphs: [
        `Jaime Tapiador, in a personal capacity, as the author of this non-profit demo. Contact for any privacy matter: ${PRIVACY_CONTACT}.`,
      ],
    },
    {
      title: "What we do not collect",
      paragraphs: [
        "Your documents never leave your device: the fingerprint is computed in your browser and only the fingerprint is sent when you decide to seal. We do not keep the file or its name.",
        "We use no analytics, advertising or tracking cookies. Checking a document needs no account and stores no data about you.",
      ],
    },
    {
      title: "What we collect if you create an account",
      paragraphs: [
        "Account data: your email address and an internal identifier. If you sign in with Google, Google also gives us your name and profile picture, which we neither use nor display. If you use a password, Firebase Authentication stores it encrypted and we never see it.",
        "Usage data: for each document you seal from this website we keep the fingerprint, transaction, network and date, linked to your identifier, to show you “Your seals”. We also keep a daily seal counter to apply the usage limit.",
        "Technical data: Firebase Authentication records your IP address and browser when you sign in, for security. Our functions' logs record your internal identifier, the fingerprint and the transaction of each seal, to diagnose errors and abuse.",
        "Storage in your browser: the Firebase Authentication session is kept so you do not have to sign in every time. It is essential for the service, it is not a tracking cookie and it is removed when you sign out.",
      ],
    },
    {
      title: "Purpose and legal basis",
      paragraphs: [
        "To create and manage your account, let you seal documents, show you your seals and limit automated use of the service. We use the data for nothing else: no advertising, no profiling, no automated decisions, and we do not share it with third parties.",
        "The legal basis is providing the service you request when creating the account (Article 6(1)(b) GDPR). Technical logs for security and abuse prevention rely on our legitimate interest in keeping the service available and secure (Article 6(1)(f) GDPR).",
      ],
    },
    {
      title: "Who processes data on our behalf",
      paragraphs: [
        "Google, as data processor, through Firebase Authentication, Cloud Functions and Firestore, under the Google Cloud and Firebase data protection terms.",
        "Firestore and the functions are in the European Union (European multi-region and Belgium). Firebase Authentication does not allow choosing a region, so Google may process account data outside the European Union, mainly in the United States. Those transfers rely on the EU-U.S. Data Privacy Framework, to which Google adheres, and on the European Commission's standard contractual clauses.",
        "If you sign in with Google, sign-in happens on Google's pages and is also governed by Google's own privacy policy.",
      ],
    },
    {
      title: "What stays on the blockchain",
      paragraphs: [
        "Each seal leaves on the public Base Sepolia network the document's fingerprint, the date and the demo account that sent it. It does not include your email or identifier. It is public, anyone can query it, and it cannot be deleted, by you or by us.",
        "A fingerprint does not allow anyone to rebuild the document, but anyone who has the same document can check that it was sealed. That is why we ask you not to seal documents containing personal data.",
      ],
    },
    {
      title: "How long we keep data",
      paragraphs: [
        "Your account and the link to your seals, until you delete the account. On deletion they are removed from our database immediately; Google removes them from its backups within 180 days.",
        "The daily counter is overwritten every day. Our functions' logs are kept for 30 days. The IP addresses recorded by Firebase Authentication, for a few weeks.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: [
        "You can delete your account at any time from “Your seals”: the account and the link between your account and your seals are removed.",
        `You can also exercise your rights of access, rectification, erasure, objection, restriction of processing and portability by writing to ${PRIVACY_CONTACT}. We will reply within one month.`,
        "If you think we have not handled your request properly, you can lodge a complaint with the Spanish Data Protection Agency (aepd.es).",
      ],
    },
    {
      title: "Changes",
      paragraphs: [
        "If the way we process data changes, we will update this page and its date. If the change is significant, we will announce it on the website.",
      ],
    },
  ],
};

export const PRIVACY: Record<Locale, PrivacyContent> = { es, en };
