import { CONSENT_VENDORS, consentConfig } from "@sello/core/consent";
import { useConsentTexts } from "./useConsentTexts.ts";

const vendorById = new Map(CONSENT_VENDORS.map((v) => [v.id, v]));

/** Tabla de la política de cookies, generada desde el inventario de texts.ts. */
export function CookieTable() {
  const T = useConsentTexts();
  return (
    <div className="space-y-8">
      {consentConfig.categories.map((category) => {
        const text = T.categories[category.id];
        const rows = T.rows.filter((row) => {
          const vendor = vendorById.get(row.vendor);
          return vendor?.category === category.id && vendor.enabled;
        });
        return (
          <section key={category.id}>
            <h3 className="font-sans text-base font-semibold text-strong">
              {text.title}
              {category.locked && <span className="font-normal text-muted"> · {T.alwaysActive}</span>}
            </h3>
            <p className="mt-1 text-sm text-muted">{text.summary}</p>
            {rows.length === 0 ? (
              <p className="mt-3 text-sm">{T.noneActive}</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse font-sans text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-strong">
                      <th scope="col" className="py-2 pr-3 font-semibold">{T.table.name}</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">{T.table.vendor}</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">{T.table.purpose}</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">{T.table.type}</th>
                      <th scope="col" className="py-2 font-semibold">{T.table.duration}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const vendor = T.vendors[row.vendor];
                      return (
                        <tr key={`${row.vendor}-${row.name}`} className="border-b border-line/50 align-top">
                          <td className="py-2 pr-3 font-mono text-xs text-strong">{row.name}</td>
                          <td className="py-2 pr-3">
                            {vendor.privacyUrl ? (
                              <a href={vendor.privacyUrl} target="_blank" rel="noopener noreferrer" className="link">
                                {vendor.name}
                              </a>
                            ) : (
                              vendor.name
                            )}
                          </td>
                          <td className="py-2 pr-3">{row.purpose}</td>
                          <td className="py-2 pr-3 text-muted">{T.storage[row.storage]}</td>
                          <td className="py-2 text-muted">{row.duration}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
