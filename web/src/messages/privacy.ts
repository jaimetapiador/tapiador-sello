import type { Locale } from "../i18n.tsx";

// Política de privacidad y de cookies del sello. Revisada con Jaime el 23/11/2026 (Google Analytics
// con consentimiento añadido el mismo día).
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
  /** Apartado #cookies: texto, botón de preferencias, ID de la decisión y tabla generada. */
  cookies: PrivacySection & { settingsButton: string };
}

const es: PrivacyContent = {
  title: "Privacidad",
  updated: "Última actualización: 23 de noviembre de 2026",
  intro:
    "Este demostrador está diseñado para tratar los menos datos posibles: comprobar un documento no requiere cuenta y tu documento nunca sale de tu equipo. Aquí se explica qué datos se tratan si aceptas la analítica o creas una cuenta para sellar, y qué cookies usamos.",
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
        "No usamos cookies de publicidad. Google Analytics solo se carga si lo aceptas en el aviso de cookies; hasta entonces no se hace ninguna petición a Google Analytics. Para comprobar un documento no hace falta cuenta.",
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
      title: "Estadísticas de visitas (Google Analytics)",
      paragraphs: [
        "Solo si lo aceptas, usamos Google Analytics 4 para saber de forma agregada qué páginas se visitan, desde qué país o región, con qué tipo de dispositivo y navegador y desde qué sitio se llega. Google Analytics asigna a tu navegador un identificador seudónimo en una cookie; no recoge tu nombre ni tu correo, y Google indica que Google Analytics 4 no registra ni almacena las direcciones IP.",
        "Hemos desactivado Google Signals y la personalización de anuncios: los datos no se usan para publicidad. Puedes retirar tu consentimiento en cualquier momento desde «Preferencias de cookies», al pie de cada página.",
      ],
    },
    {
      title: "Registro de tus decisiones sobre cookies",
      paragraphs: [
        "Para poder demostrar qué elegiste, guardamos cada decisión: un identificador aleatorio, la fecha, si aceptaste o rechazaste la analítica, la versión de esta política, el tipo de dispositivo y la página en la que decidiste. No guardamos tu IP, tu nombre ni tu cuenta. El identificador aparece en el panel de preferencias; si nos escribes sobre tu consentimiento, indícalo.",
      ],
    },
    {
      title: "Para qué y con qué base jurídica",
      paragraphs: [
        "Para crear y gestionar tu cuenta, permitirte sellar documentos, mostrarte tus sellos y limitar el uso automatizado del servicio. No usamos los datos para nada más: ni publicidad, ni perfiles, ni decisiones automatizadas, y no los cedemos a terceros.",
        "La base jurídica es la prestación del servicio que solicitas al crear la cuenta (artículo 6.1.b del RGPD). Los registros técnicos para seguridad y prevención de abusos se basan en el interés legítimo en mantener el servicio disponible y seguro (artículo 6.1.f del RGPD).",
        "La analítica se basa en tu consentimiento (artículo 6.1.a del RGPD y artículo 22.2 de la LSSI). El registro de tus decisiones sobre cookies, en la obligación legal de poder demostrar el consentimiento (artículos 6.1.c y 7.1 del RGPD).",
      ],
    },
    {
      title: "Quién trata los datos por nosotros",
      paragraphs: [
        "Google, como encargado del tratamiento, a través de Firebase Authentication, Cloud Functions y Firestore, con las cláusulas de protección de datos de Google Cloud y Firebase, y de Google Analytics si aceptas la analítica, con las condiciones de protección de datos de Google Ads y Analytics.",
        "Firestore y las funciones están en la Unión Europea (multirregión europea y Bélgica). Firebase Authentication y Google Analytics no permiten elegir región, por lo que Google puede tratar esos datos fuera de la Unión Europea, principalmente en Estados Unidos. Esas transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU., al que Google está adherido, y en las cláusulas contractuales tipo de la Comisión Europea.",
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
        "Los datos de Google Analytics vinculados al identificador seudónimo, 2 meses. Tu decisión sobre cookies se recuerda 6 meses en tu navegador y su registro se conserva 3 años, el plazo de prescripción de las infracciones de la LSSI; después se borra automáticamente.",
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
        "Si cambia la forma de tratar los datos, actualizaremos esta página y su fecha. Si el cambio es relevante, lo avisaremos en la propia web. Si añadimos un proveedor de cookies, te volveremos a pedir permiso antes de activarlo.",
      ],
    },
  ],
  cookies: {
    title: "Cookies",
    paragraphs: [
      "Una cookie es un pequeño archivo que un sitio guarda en tu navegador para recordar información. Esta política se aplica igual al almacenamiento local (IndexedDB, localStorage) que usamos.",
      "Las necesarias no requieren tu permiso: recuerdan tu decisión sobre cookies y, si entras para sellar, mantienen tu sesión. Las analíticas (Google Analytics) solo se activan si las aceptas. Si retiras el permiso, borramos sus cookies y recargamos la página para que deje de medir. También puedes borrar las cookies desde la configuración de tu navegador.",
      "Con Google usamos el modo de consentimiento básico: su etiqueta no se carga hasta que aceptas, y le comunicamos que el almacenamiento y el uso de datos para publicidad están denegados.",
    ],
    settingsButton: "Configurar cookies",
  },
};

const en: PrivacyContent = {
  title: "Privacy",
  updated: "Last updated: 23 November 2026",
  intro:
    "This demo is designed to process as little data as possible: checking a document needs no account and your document never leaves your device. This page explains what data is processed if you accept analytics or create an account to seal, and which cookies we use.",
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
        "We use no advertising cookies. Google Analytics is only loaded if you accept it in the cookie notice; until then no request is made to Google Analytics. Checking a document needs no account.",
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
      title: "Visit statistics (Google Analytics)",
      paragraphs: [
        "Only if you accept it, we use Google Analytics 4 to learn in aggregate which pages are visited, from which country or region, with which kind of device and browser, and from which website people arrive. Google Analytics gives your browser a pseudonymous identifier in a cookie; it does not collect your name or email, and Google states that Google Analytics 4 does not log or store IP addresses.",
        "We have switched off Google Signals and ad personalisation: the data is not used for advertising. You can withdraw your consent at any time from “Cookie preferences” in the footer of every page.",
      ],
    },
    {
      title: "Record of your cookie choices",
      paragraphs: [
        "To be able to prove what you chose, we keep each decision: a random identifier, the date, whether you accepted or rejected analytics, the version of this policy, the device type and the page where you decided. We do not keep your IP, name or account. The identifier is shown in the preferences panel; if you write to us about your consent, please include it.",
      ],
    },
    {
      title: "Purpose and legal basis",
      paragraphs: [
        "To create and manage your account, let you seal documents, show you your seals and limit automated use of the service. We use the data for nothing else: no advertising, no profiling, no automated decisions, and we do not share it with third parties.",
        "The legal basis is providing the service you request when creating the account (Article 6(1)(b) GDPR). Technical logs for security and abuse prevention rely on our legitimate interest in keeping the service available and secure (Article 6(1)(f) GDPR).",
        "Analytics relies on your consent (Article 6(1)(a) GDPR and Article 22(2) of the Spanish LSSI). The record of your cookie choices relies on the legal obligation to be able to demonstrate consent (Articles 6(1)(c) and 7(1) GDPR).",
      ],
    },
    {
      title: "Who processes data on our behalf",
      paragraphs: [
        "Google, as data processor, through Firebase Authentication, Cloud Functions and Firestore, under the Google Cloud and Firebase data protection terms, and through Google Analytics if you accept analytics, under the Google Ads and Analytics data protection terms.",
        "Firestore and the functions are in the European Union (European multi-region and Belgium). Firebase Authentication and Google Analytics do not allow choosing a region, so Google may process that data outside the European Union, mainly in the United States. Those transfers rely on the EU-U.S. Data Privacy Framework, to which Google adheres, and on the European Commission's standard contractual clauses.",
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
        "Google Analytics data linked to the pseudonymous identifier, 2 months. Your cookie choice is remembered for 6 months in your browser and its record is kept for 3 years, the limitation period for infringements of the Spanish LSSI; it is then deleted automatically.",
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
        "If the way we process data changes, we will update this page and its date. If the change is significant, we will announce it on the website. If we add a cookie provider, we will ask for your permission again before activating it.",
      ],
    },
  ],
  cookies: {
    title: "Cookies",
    paragraphs: [
      "A cookie is a small file a website stores in your browser to remember information. This policy applies equally to the local storage (IndexedDB, localStorage) we use.",
      "Necessary ones do not require your permission: they remember your cookie choice and, if you sign in to seal, keep your session. Analytics cookies (Google Analytics) are only activated if you accept them. If you withdraw permission, we delete their cookies and reload the page so measurement stops. You can also delete cookies from your browser settings.",
      "With Google we use basic consent mode: its tag is not loaded until you accept, and we tell it that storage and data use for advertising are denied.",
    ],
    settingsButton: "Cookie settings",
  },
};

export const PRIVACY: Record<Locale, PrivacyContent> = { es, en };
