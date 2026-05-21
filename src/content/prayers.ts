export interface Prayer {
  id: string;
  title: string;
  text: string;
}

export const PREPARATORY_PRAYER =
  `Meu bom Deus e Salvador, eis-me aqui diante de vós.\n` +
  `Meu Senhor e meu Deus, a quem pouco tenho amado, em consideração de minhas repetidas faltas, pelos méritos inefáveis do vosso Filho, crucificado e morto por meu amor, pelos méritos do seu Preciosíssimo Sangue, pelas suas lágrimas e agonia, tende piedade de mim.\n\n` +
  `Espírito Santo, dai-me luz para conhecer os meus pecados, sincero arrependimento para os aborrecer, firme propósito para nunca mais os cometer, dai-me a graça de, enxergando minha miséria, reconhecer o quanto tenho vos ofendido, vós que sois digno de ser amado sobre todas as coisas.\n\n` +
  `Fazei com que essa confissão que pretendo fazer aumente em meu coração a fé, a esperança e, principalmente, a caridade.\n\n` +
  `Ó Virgem Santíssima, ajudai-me a fazer uma boa confissão.\n\n` +
  `Amém.`;

export const prayers: Prayer[] = [
  {
    id: 'oracao-preparatoria',
    title: 'Oração Preparatória',
    text: PREPARATORY_PRAYER,
  },
  {
    id: 'pai-nosso',
    title: 'Pai Nosso',
    text:
      `Pai nosso, que estais nos céus,\n` +
      `santificado seja o vosso nome.\n` +
      `Venha a nós o vosso reino.\n` +
      `Seja feita a vossa vontade,\n` +
      `assim na terra como no céu.\n\n` +
      `O pão nosso de cada dia nos dai hoje.\n` +
      `Perdoai-nos as nossas ofensas,\n` +
      `assim como nós perdoamos\n` +
      `a quem nos tem ofendido.\n\n` +
      `E não nos deixeis cair em tentação,\n` +
      `mas livrai-nos do mal.\n\n` +
      `Amém.`,
  },
  {
    id: 'ave-maria',
    title: 'Ave Maria',
    text:
      `Ave Maria, cheia de graça,\n` +
      `o Senhor é convosco.\n` +
      `Bendita sois vós entre as mulheres,\n` +
      `e bendito é o fruto do vosso ventre, Jesus.\n\n` +
      `Santa Maria, Mãe de Deus,\n` +
      `rogai por nós, pecadores,\n` +
      `agora e na hora de nossa morte.\n\n` +
      `Amém.`,
  },
  {
    id: 'ato-contrição',
    title: 'Ato de Contrição',
    text:
      `Senhor, eu me arrependo sinceramente de todo mal que pratiquei e do bem que deixei de fazer.\n` +
      `Pecando, eu Vos ofendi, meu Deus e Sumo Bem, digno de ser amado sobre todas as coisas.\n\n` +
      `Prometo firmemente, ajudado com a Vossa graça, fazer penitência e fugir às ocasiões de pecar.\n\n` +
      `Senhor, tende piedade de mim pelos méritos da Paixão, Morte e Ressurreição de Jesus Cristo, nosso Salvador.\n\n` +
      `Amém.`,
  },
];
