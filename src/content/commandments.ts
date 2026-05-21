export interface Commandment {
  id: number;
  title: string;
  description: string;
  questions: string[];
}

export const commandments: Commandment[] = [
  {
    id: 1,
    title: "Amar a Deus sobre todas as coisas",
    description:
      "Deus deve ser o centro da vida. Este mandamento nos convida a examinar se estamos colocando algo acima de Deus — seja trabalho, dinheiro, conforto ou até nossos próprios desejos.",
    questions: [
      "Em quais momentos vivi como se Deus não existisse?",
      "O que ocupa mais espaço na minha mente do que Deus?",
      "Eu só procuro Deus quando preciso?",
      "Eu confio realmente em Deus?",
      "O que tenho medo de perder?",
    ],
  },
  {
    id: 2,
    title: "Não tomar o Santo Nome de Deus em vão",
    description:
      "O nome de Deus é santo e merece reverência. Este mandamento nos lembra de tratar o sagrado com respeito em nossas palavras e atitudes.",
    questions: [
      "Usei o nome de Deus de forma leviana ou como palavrão?",
      "Fiz promessas a Deus que não cumpri?",
      "Falei com irreverência sobre coisas sagradas?",
      "Respeitei os sacramentos com a devida seriedade?",
    ],
  },
  {
    id: 3,
    title: "Guardar os domingos e festas de guarda",
    description:
      "O domingo é o dia do Senhor, reservado para o descanso e a adoração. Este mandamento nos convida a dedicar tempo a Deus e à comunidade.",
    questions: [
      "Participei da Missa aos domingos e dias de preceito?",
      "Dediquei tempo à oração e ao descanso no domingo?",
      "Trabalhei desnecessariamente aos domingos?",
      "Tratei o domingo como um dia qualquer?",
    ],
  },
  {
    id: 4,
    title: "Honrar pai e mãe",
    description:
      "Este mandamento nos pede para respeitar, amar e cuidar de nossos pais e daqueles que exercem autoridade legítima em nossa vida.",
    questions: [
      "Tratei meus pais com respeito e gratidão?",
      "Fui paciente com suas limitações?",
      "Negligenciei o cuidado com minha família?",
      "Causei sofrimento desnecessário aos meus pais?",
      "Honrei a memória dos que já partiram?",
    ],
  },
  {
    id: 5,
    title: "Não matar",
    description:
      "A vida humana é sagrada desde a concepção até a morte natural. Este mandamento vai além do ato físico — inclui raiva, ódio e desprezo pelo próximo.",
    questions: [
      "Guardei rancor ou ódio de alguém?",
      "Desejei mal a outra pessoa?",
      "Fui violento em palavras ou atitudes?",
      "Prejudiquei a saúde de alguém, inclusive a minha?",
      "Fui indiferente ao sofrimento alheio?",
    ],
  },
  {
    id: 6,
    title: "Não pecar contra a castidade",
    description:
      "Este mandamento nos chama a viver a sexualidade com dignidade, respeito e de acordo com o plano de Deus para o amor humano.",
    questions: [
      "Vivi a castidade de acordo com meu estado de vida?",
      "Consumi conteúdos que ferem a dignidade humana?",
      "Respeitei o corpo e a intimidade do outro?",
      "Alimentei pensamentos ou desejos desordenados?",
    ],
  },
  {
    id: 7,
    title: "Não roubar",
    description:
      "Respeitar o que pertence ao outro é um ato de justiça. Este mandamento abrange desde o furto até a desonestidade e a exploração.",
    questions: [
      "Tomei algo que não me pertencia?",
      "Fui honesto em meus negócios e trabalho?",
      "Paguei o justo a quem trabalhou para mim?",
      "Fui generoso com quem tem menos?",
      "Cuidei bem dos bens que me foram confiados?",
    ],
  },
  {
    id: 8,
    title: "Não levantar falso testemunho",
    description:
      "A verdade é fundamento da confiança. Este mandamento nos convida a ser honestos, evitar a fofoca e proteger a reputação alheia.",
    questions: [
      "Menti ou omiti a verdade?",
      "Falei mal de alguém pelas costas?",
      "Espalhei boatos ou fofocas?",
      "Julguei alguém sem conhecer os fatos?",
      "Fui sincero em meus relacionamentos?",
    ],
  },
  {
    id: 9,
    title: "Não cobiçar a mulher do próximo",
    description:
      "Este mandamento nos chama à pureza do coração e ao respeito pela dignidade do compromisso alheio.",
    questions: [
      "Desejei a esposa ou o marido de outra pessoa?",
      "Alimentei fantasias que desrespeitam compromissos alheios?",
      "Fui fiel ao meu cônjuge em pensamento e ação?",
      "Respeitei os relacionamentos alheios?",
    ],
  },
  {
    id: 10,
    title: "Não cobiçar as coisas alheias",
    description:
      "A inveja e a ganância nos afastam de Deus e do próximo. Este mandamento nos convida a cultivar a gratidão e a generosidade.",
    questions: [
      "Senti inveja do que os outros possuem?",
      "Fui grato pelo que tenho?",
      "Desejei os bens alheios de forma desordenada?",
      "A busca por coisas materiais dominou minha vida?",
      "Soube partilhar com generosidade?",
    ],
  },
];
