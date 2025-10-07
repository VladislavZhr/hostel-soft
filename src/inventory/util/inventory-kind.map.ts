// src/inventory/inventory-kind.map.ts
export enum InventoryKindEnum {
  TULLE = "tulle",
  CURTAINS = "curtains",
  BLANKET = "blanket",
  MATTRESS = "mattress",
  PILLOWCASE = "pillowcase",
  MATTRESS_COVER = "mattressCover",
  DUVET_COVER = "duvetCover",
  TOWEL_WAFFLE = "waffleTowel",
  TOWEL_TERRY = "terryTowel",
  SHEET = "sheet",
  BEDSPREAD = "cover",
  PILLOW = "pillow",
  TABLECLOTH = "tablecloth",
  BED_SET = "bedSet",
}

export const INVENTORY_EN_TO_UA: Record<InventoryKindEnum, string> = {
  [InventoryKindEnum.TULLE]: "Тюль",
  [InventoryKindEnum.CURTAINS]: "Штори",
  [InventoryKindEnum.BLANKET]: "Ковдра",
  [InventoryKindEnum.MATTRESS]: "Матрац",
  [InventoryKindEnum.PILLOWCASE]: "Наволочки",
  [InventoryKindEnum.MATTRESS_COVER]: "Чохол",
  [InventoryKindEnum.DUVET_COVER]: "Підковдра",
  [InventoryKindEnum.TOWEL_WAFFLE]: "Рушник вафельний",
  [InventoryKindEnum.TOWEL_TERRY]: "Рушник махровий",
  [InventoryKindEnum.SHEET]: "Простирадла",
  [InventoryKindEnum.BEDSPREAD]: "Покривала",
  [InventoryKindEnum.PILLOW]: "Подушка",
  [InventoryKindEnum.TABLECLOTH]: "Скатертина",
  [InventoryKindEnum.BED_SET]: "К-т білизни",
};

// універсальна функція
export function labelInventoryKind(kind: string): string {
  return INVENTORY_EN_TO_UA[kind as InventoryKindEnum] ?? kind;
}
