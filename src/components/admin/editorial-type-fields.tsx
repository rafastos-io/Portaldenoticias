"use client";

import { useId, useState, type ReactNode } from "react";

import type { EditorialType } from "@/lib/admin/content-form";

export type EditorialFormInitial = {
  authorName: string;
  correctionNote: string | null;
  editorialType: EditorialType;
  keyTopics: string[];
  sponsorshipLabel: string | null;
};

const control =
  "min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 transition-colors hover:border-slate-500";

export function EditorialTypeFields({
  initial,
}: {
  initial?: EditorialFormInitial;
}) {
  const [type, setType] = useState<EditorialType>(
    initial?.editorialType ?? "standard",
  );
  const reactId = useId();

  return (
    <>
      <Field label="Variante editorial" name="editorialType">
        <select
          className={control}
          name="editorialType"
          onChange={(event) =>
            setType(event.target.value as EditorialType)
          }
          value={type}
        >
          <option value="standard">Matéria padrão</option>
          <option value="explainer">Explicador ou análise</option>
          <option value="sponsored">Patrocinada fictícia</option>
          <option value="correction">Correção</option>
        </select>
      </Field>

      {type === "explainer" ? (
        <Field label="Tópicos-chave (um por linha, até 8)" name="keyTopics">
          <textarea
            className={`${control} min-h-24 resize-y`}
            defaultValue={
              initial?.keyTopics?.length
                ? initial.keyTopics.join("\n")
                : ""
            }
            maxLength={800}
            name="keyTopics"
          />
        </Field>
      ) : null}

      {type === "sponsored" ? (
        <Field
          label="Patrocinador fictício"
          name="sponsorshipLabel"
        >
          <input
            className={control}
            defaultValue={initial?.sponsorshipLabel ?? ""}
            maxLength={120}
            minLength={2}
            name="sponsorshipLabel"
            placeholder="Ex.: Instituto Fictício de Longevidade"
            required
          />
        </Field>
      ) : null}

      {type === "correction" ? (
        <Field label="Nota de correção" name="correctionNote">
          <textarea
            className={`${control} min-h-28 resize-y`}
            defaultValue={initial?.correctionNote ?? ""}
            maxLength={500}
            minLength={12}
            name="correctionNote"
            placeholder="Explique o que foi corrigido nesta matéria demonstrativa."
            required
          />
        </Field>
      ) : null}

      <input
        name="_editorial-type-sentinel"
        type="hidden"
        value={`${reactId}:${type}`}
      />
    </>
  );
}

function Field({
  children,
  label,
  name,
}: {
  children: ReactNode;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-800">
      {label}
      {children}
      <span className="sr-only">Campo {name}</span>
    </label>
  );
}