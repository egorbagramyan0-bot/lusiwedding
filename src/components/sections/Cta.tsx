"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cta, leadForm } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Куда уходит заявка.
 *
 * Пока никуда: обработчика нет. Форма проверяет поля и честно сообщает,
 * что не подключена, — молча делать вид, что заявка ушла, нельзя.
 *
 * TODO: подставить адрес обработчика (почта, CRM или бот в мессенджере).
 * Как только здесь появится строка, форма начнёт отправлять POST с JSON
 * {name, contact, date, message} — остальной код менять не нужно.
 */
const LEAD_ENDPOINT: string | null = null;

type Values = { name: string; contact: string; date: string; message: string };
type Status = "idle" | "sending" | "sent" | "offline" | "error";

const EMPTY: Values = { name: "", contact: "", date: "", message: "" };

/** Общий вид поля: прозрачный фон и волосяная линия снизу. */
const field =
  "w-full border-b bg-transparent py-3 text-[0.9375rem] text-wine-ink outline-none transition-colors placeholder:text-wine-ink/65 focus:border-gold-dim";
const labelText = "block text-caption text-gold-dim uppercase";

export function Cta() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Values | "consent", string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  function update(key: keyof Values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // ошибка снимается сразу, как только человек начал править поле
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: typeof errors = {};
    if (!values.name.trim()) next.name = leadForm.errors.name;
    if (!values.contact.trim()) next.contact = leadForm.errors.contact;
    if (!consent) next.consent = leadForm.errors.consent;

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("idle");
      return;
    }

    if (!LEAD_ENDPOINT) {
      setStatus("offline");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      setValues(EMPTY);
      setConsent(false);
    } catch {
      setStatus("error");
    }
  }

  const message =
    status === "sent"
      ? leadForm.success
      : status === "offline"
        ? leadForm.offline
        : status === "error"
          ? leadForm.errors.failed
          : null;

  return (
    <section
      id="lead"
      // тарифы выше на том же фоне — иначе секции сливаются
      className="border-t border-wine-ink/10 bg-ivory py-(--section-y) text-wine-ink"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2
              data-split
              className="font-heading text-[clamp(2.15rem,4.4vw,3.35rem)] leading-tight"
            >
              {cta.title}
            </h2>

            <span
              aria-hidden
              data-rule
              data-rule-delay={300}
              className="hairline mt-8 w-20 bg-gold-dim opacity-70"
            />

            <p
              data-reveal
              data-reveal-delay={200}
              className="mt-8 max-w-[34ch] text-sm leading-relaxed text-wine-ink/70"
            >
              {cta.note}
            </p>
          </div>

          <Reveal delay={120}>
            <form noValidate onSubmit={handleSubmit}>
              <div className="grid gap-8 sm:grid-cols-2">
                <Field
                  id="lead-name"
                  label={leadForm.fields.name.label}
                  error={errors.name}
                >
                  <input
                    id="lead-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={leadForm.fields.name.placeholder}
                    value={values.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "lead-name-error" : undefined}
                    className={cn(field, errors.name ? "border-alert" : "border-wine-ink/20")}
                  />
                </Field>

                <Field
                  id="lead-contact"
                  label={leadForm.fields.contact.label}
                  error={errors.contact}
                >
                  <input
                    id="lead-contact"
                    name="contact"
                    type="text"
                    autoComplete="tel"
                    placeholder={leadForm.fields.contact.placeholder}
                    value={values.contact}
                    onChange={(e) => update("contact", e.target.value)}
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? "lead-contact-error" : undefined}
                    className={cn(field, errors.contact ? "border-alert" : "border-wine-ink/20")}
                  />
                </Field>
              </div>

              <div className="mt-8">
                <Field
                  id="lead-date"
                  label={leadForm.fields.date.label}
                  hint={leadForm.fields.date.hint}
                >
                  <input
                    id="lead-date"
                    name="date"
                    type="text"
                    placeholder={leadForm.fields.date.placeholder}
                    value={values.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={cn(field, "border-wine-ink/20")}
                  />
                </Field>
              </div>

              <div className="mt-8">
                <Field
                  id="lead-message"
                  label={leadForm.fields.message.label}
                  hint={leadForm.fields.message.hint}
                >
                  <textarea
                    id="lead-message"
                    name="message"
                    rows={3}
                    placeholder={leadForm.fields.message.placeholder}
                    value={values.message}
                    onChange={(e) => update("message", e.target.value)}
                    className={cn(field, "resize-none border-wine-ink/20")}
                  />
                </Field>
              </div>

              <div className="mt-10">
                <label className="-my-3 flex cursor-pointer items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setErrors((prev) => ({ ...prev, consent: undefined }));
                    }}
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? "lead-consent-error" : undefined}
                    className="mt-0.5 size-4 shrink-0 accent-gold-dim"
                  />
                  <span className="text-[0.8125rem] leading-relaxed text-wine-ink/70">
                    {leadForm.consent}
                  </span>
                </label>
                {errors.consent ? (
                  <p id="lead-consent-error" className="mt-2 text-[0.8125rem] text-alert">
                    {errors.consent}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="group mt-10 flex w-full cursor-pointer items-center justify-center gap-4 border border-gold-dim bg-gold-dim px-6 py-4 text-caption text-ivory uppercase transition-colors hover:bg-transparent hover:text-gold-dim disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {status === "sending" ? leadForm.sending : leadForm.submit}
                <span
                  aria-hidden
                  className="text-xl transition-transform duration-500 group-hover:translate-x-2 motion-reduce:transform-none"
                >
                  &rarr;
                </span>
              </button>

              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "mt-6 max-w-[46ch] text-[0.8125rem] leading-relaxed",
                  status === "sent" ? "text-wine-ink/70" : "text-alert",
                )}
              >
                {message}
              </p>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/** Подпись, поле и сообщение об ошибке под ним. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelText}>
        {label}
        {hint ? (
          <span className="ml-2 font-sans text-[0.8125rem] font-normal tracking-normal normal-case text-wine-ink/65">
            {hint}
          </span>
        ) : null}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
