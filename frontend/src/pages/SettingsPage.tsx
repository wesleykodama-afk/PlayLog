import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import type { AffiliateProduct, CustomLink, Settings } from "../types";

const languages = ["English", "Spanish", "Chinese", "Japanese", "Russian", "Portuguese"] as const;

type AffiliateForm = {
  name: string;
  imageUrl: string;
  description: string;
  affiliateLink: string;
};

export function SettingsPage() {
  const { token, user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [editingAffiliateId, setEditingAffiliateId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState<AffiliateForm>({
    name: "",
    imageUrl: "",
    description: "",
    affiliateLink: ""
  });

  const load = async () => {
    if (!token) {
      return;
    }

    const [settingsData, productsData] = await Promise.all([
      apiFetch<Settings | null>("/settings", {}, token),
      apiFetch<AffiliateProduct[]>("/affiliate-products")
    ]);

    setSettings(
      settingsData ?? {
        id: "",
        preferredLanguage: "English",
        steamProfileUrl: "",
        epicProfileUrl: "",
        gogProfileUrl: "",
        customLinks: []
      }
    );
    setProducts(productsData);
  };

  useEffect(() => {
    load();
  }, [token]);

  const updateField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!settings) {
      return;
    }
    setSettings({ ...settings, [key]: value });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !settings) {
      return;
    }

    await apiFetch<Settings>(
      "/settings",
      {
        method: "PUT",
        body: JSON.stringify({
          preferredLanguage: settings.preferredLanguage,
          steamProfileUrl: settings.steamProfileUrl,
          epicProfileUrl: settings.epicProfileUrl,
          gogProfileUrl: settings.gogProfileUrl,
          customLinks: settings.customLinks
        })
      },
      token
    );

    setMessage("Settings saved.");
  };

  const connectSteam = async () => {
    if (!token || !settings?.steamProfileUrl) {
      return;
    }

    await apiFetch(
      "/settings/steam/connect",
      {
        method: "POST",
        body: JSON.stringify({ steamProfileUrl: settings.steamProfileUrl })
      },
      token
    );

    setMessage("Steam account connected.");
  };

  const syncSteam = async () => {
    if (!token) {
      return;
    }

    const result = await apiFetch<{ message: string; imported: number }>("/settings/steam/sync", { method: "POST" }, token);
    setMessage(`${result.message} Imported ${result.imported} games.`);
  };

  const addLink = () => {
    if (!settings) {
      return;
    }

    const next: CustomLink = {
      name: `Link ${settings.customLinks.length + 1}`,
      url: "https://"
    };
    updateField("customLinks", [...settings.customLinks, next]);
  };

  const saveAffiliate = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    await apiFetch(
      editingAffiliateId ? `/affiliate-products/${editingAffiliateId}` : "/affiliate-products",
      {
        method: editingAffiliateId ? "PUT" : "POST",
        body: JSON.stringify(adminForm)
      },
      token
    );

    setAdminForm({ name: "", imageUrl: "", description: "", affiliateLink: "" });
    setEditingAffiliateId(null);
    await load();
  };

  const removeAffiliate = async (id: string) => {
    if (!token) {
      return;
    }

    await apiFetch(`/affiliate-products/${id}`, { method: "DELETE" }, token);
    await load();
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-header">
          <h2>Settings</h2>
          <span>Gear-ready control center</span>
        </div>

        {settings && (
          <form className="stack-form" onSubmit={save}>
            <label>
              Preferred language
              <select
                value={settings.preferredLanguage}
                onChange={(event) => updateField("preferredLanguage", event.target.value as Settings["preferredLanguage"])}
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-grid">
              <label>
                Steam profile URL
                <input
                  value={settings.steamProfileUrl ?? ""}
                  onChange={(event) => updateField("steamProfileUrl", event.target.value)}
                  placeholder="https://steamcommunity.com/profiles/..."
                />
              </label>
              <label>
                Epic profile URL
                <input value={settings.epicProfileUrl ?? ""} onChange={(event) => updateField("epicProfileUrl", event.target.value)} />
              </label>
              <label>
                GOG profile URL
                <input value={settings.gogProfileUrl ?? ""} onChange={(event) => updateField("gogProfileUrl", event.target.value)} />
              </label>
            </div>

            <div className="button-row">
              <button type="button" className="secondary-button" onClick={connectSteam}>
                Connect Steam
              </button>
              <button type="button" className="secondary-button" onClick={syncSteam}>
                Sync Steam
              </button>
              <button type="submit" className="primary-button">
                Save links
              </button>
            </div>

            <div className="panel inset">
              <div className="panel-header">
                <h3>Custom Links</h3>
                <button type="button" className="secondary-button" onClick={addLink}>
                  Add link
                </button>
              </div>
              <div className="stack-form">
                {settings.customLinks.map((link, index) => (
                  <div className="form-grid" key={`${link.name}-${index}`}>
                    <label>
                      Name
                      <input
                        value={link.name}
                        onChange={(event) => {
                          const next = [...settings.customLinks];
                          next[index] = { ...next[index], name: event.target.value };
                          updateField("customLinks", next);
                        }}
                      />
                    </label>
                    <label>
                      URL
                      <input
                        value={link.url}
                        onChange={(event) => {
                          const next = [...settings.customLinks];
                          next[index] = { ...next[index], url: event.target.value };
                          updateField("customLinks", next);
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {message && <p className="success-text">{message}</p>}
          </form>
        )}
      </section>

      {user?.role === "ADMIN" && (
        <section className="panel">
          <div className="panel-header">
            <h2>Affiliate Products</h2>
            <span>Admin only</span>
          </div>

          <form className="stack-form" onSubmit={saveAffiliate}>
            <div className="form-grid">
              <label>
                Name
                <input value={adminForm.name} onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} />
              </label>
              <label>
                Image URL
                <input value={adminForm.imageUrl} onChange={(event) => setAdminForm({ ...adminForm, imageUrl: event.target.value })} />
              </label>
              <label>
                Affiliate Link
                <input
                  value={adminForm.affiliateLink}
                  onChange={(event) => setAdminForm({ ...adminForm, affiliateLink: event.target.value })}
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                rows={4}
                value={adminForm.description}
                onChange={(event) => setAdminForm({ ...adminForm, description: event.target.value })}
              />
            </label>
            <button className="primary-button" type="submit">
              {editingAffiliateId ? "Update affiliate product" : "Add affiliate product"}
            </button>
          </form>

          <div className="card-list">
            {products.map((product) => (
              <article className="friend-card" key={product.id}>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
                <div className="button-row">
                  <a href={product.affiliateLink} className="secondary-button" target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setEditingAffiliateId(product.id);
                      setAdminForm({
                        name: product.name,
                        imageUrl: product.imageUrl,
                        description: product.description,
                        affiliateLink: product.affiliateLink
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="secondary-button" onClick={() => removeAffiliate(product.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
