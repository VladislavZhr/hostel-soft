import { ApiProperty } from '@nestjs/swagger';

export enum InventoryKind {
  TULLE = 'tulle',
  CURTAINS = 'curtains',
  BLANKET = 'blanket',
  MATTRESS = 'mattress',
  PILLOWCASE = 'pillowcase',
  MATTRESS_COVER = 'mattressCover',
  DUVET_COVER = 'duvetCover',
  TOWEL_WAFFLE = 'waffleTowel',
  TOWEL_TERRY = 'terryTowel',
  SHEET = 'sheet',
  BEDSPREAD = 'cover',
  PILLOW = 'pillow',
  TABLECLOTH = 'tablecloth',
  BED_SET = 'bedSet',
}
