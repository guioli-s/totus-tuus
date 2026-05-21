export type Verse = {
  id: number;
  reference: string;
  text: string;
  theme: string;
};

export type PurposeMap = {
  [theme: string]: string[];
};

export const VERSES: Verse[] = [
  // AMOR
  {
    id: 1,
    reference: "1 Coríntios 13, 4-5",
    text: "A caridade é paciente, a caridade é bondosa. Não tem inveja. A caridade não é orgulhosa. Não é arrogante.",
    theme: "amor"
  },
  {
    id: 2,
    reference: "João 15, 12",
    text: "O meu preceito é este: que vos ameis uns aos outros, como eu vos amei.",
    theme: "amor"
  },
  {
    id: 3,
    reference: "1 João 4, 20",
    text: "Se alguém disser: 'Amo a Deus', mas odeia seu irmão, é mentiroso. Porque aquele que não ama seu irmão, a quem vê, não pode amar a Deus, a quem não vê.",
    theme: "amor"
  },

  // HUMILDADE
  {
    id: 4,
    reference: "Filipenses 2, 3",
    text: "Nada façais por espírito de partido ou vanglória, mas que a humildade vos ensine a considerar os outros superiores a vós mesmos.",
    theme: "humildade"
  },
  {
    id: 5,
    reference: "Mateus 23, 12",
    text: "Todo o que se exaltar será humilhado, e todo o que se humilhar será exaltado.",
    theme: "humildade"
  },

  // ARREPENDIMENTO
  {
    id: 6,
    reference: "Atos 3, 19",
    text: "Arrependei-vos, pois, e convertei-vos, para que sejam apagados os vossos pecados.",
    theme: "arrependimento"
  },
  {
    id: 7,
    reference: "1 João 1, 9",
    text: "Se reconhecemos os nossos pecados, Deus aí está fiel e justo para nos perdoar os pecados e para nos purificar de toda iniquidade.",
    theme: "arrependimento"
  },

  // PACIÊNCIA
  {
    id: 8,
    reference: "Romanos 12, 12",
    text: "Alegrai-vos na esperança, sede pacientes na tribulação, perseverai na oração.",
    theme: "paciência"
  },
  {
    id: 9,
    reference: "Tiago 1, 4",
    text: "Mas a paciência deve produzir uma obra perfeita, para que sejais perfeitos e íntegros, não faltando em coisa alguma.",
    theme: "paciência"
  },

  // CARIDADE
  {
    id: 10,
    reference: "1 Pedro 4, 8",
    text: "Antes de tudo, mantende entre vós uma ardente caridade, porque a caridade cobre a multidão dos pecados.",
    theme: "caridade"
  },
  {
    id: 11,
    reference: "Mateus 25, 40",
    text: "Em verdade vos digo: todas as vezes que fizestes isso a um destes meus irmãos mais pequeninos, foi a mim mesmo que o fizestes.",
    theme: "caridade"
  },

  // PUREZA
  {
    id: 12,
    reference: "Mateus 5, 8",
    text: "Bem-aventurados os puros de coração, porque verão a Deus.",
    theme: "pureza"
  },
  {
    id: 13,
    reference: "Filipenses 4, 8",
    text: "Tudo o que é verdadeiro, tudo o que é nobre, tudo o que é justo, tudo o que é puro... seja isso o que ocupe os vossos pensamentos.",
    theme: "pureza"
  },

  // FÉ
  {
    id: 14,
    reference: "Hebreus 11, 1",
    text: "A fé é o fundamento da esperança, é uma certeza a respeito do que não se vê.",
    theme: "fé"
  },
  {
    id: 15,
    reference: "Marcos 9, 24",
    text: "Imediatamente o pai do menino exclamou: 'Eu creio! Mas ajuda a minha falta de fé'.",
    theme: "fé"
  },

  // CONFIANÇA EM DEUS
  {
    id: 16,
    reference: "Provérbios 3, 5",
    text: "Confia no Senhor de todo o teu coração e não te apoies na tua própria inteligência.",
    theme: "confiança em Deus"
  },
  {
    id: 17,
    reference: "Salmos 37, 5",
    text: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.",
    theme: "confiança em Deus"
  },

  // VIGILÂNCIA
  {
    id: 18,
    reference: "Mateus 26, 41",
    text: "Vigiai e orai, para não cairdes em tentação. O espírito, com certeza, está pronto, mas a carne é fraca.",
    theme: "vigilância"
  },
  {
    id: 19,
    reference: "1 Pedro 5, 8",
    text: "Sede sóbrios e vigilantes. O vosso adversário, o diabo, anda em derredor como um leão que ruge, buscando a quem devorar.",
    theme: "vigilância"
  },

  // OBEDIÊNCIA
  {
    id: 20,
    reference: "João 14, 15",
    text: "Se me amais, guardareis os meus mandamentos.",
    theme: "obediência"
  },
  {
    id: 21,
    reference: "1 Samuel 15, 22",
    text: "A obediência é melhor do que o sacrifício, e a submissão é melhor do que a gordura dos carneiros.",
    theme: "obediência"
  }
];

export const PURPOSES: PurposeMap = {
  "amor": [
    "Fale bem de alguém que você costuma criticar.",
    "Ligue ou mande mensagem para um familiar apenas para saber como ele está.",
    "Sorria e cumprimente cordialmente uma pessoa que o atende no dia a dia.",
    "Ceda a sua razão em uma discussão boba para preservar a paz."
  ],
  "humildade": [
    "Escute alguém até o fim sem interromper ou contar uma história sobre você.",
    "Realize uma tarefa doméstica que outra pessoa costuma fazer, sem avisar ninguém.",
    "Aceite uma correção hoje sem se justificar ou dar desculpas.",
    "Fique em silêncio quando sentir vontade de se gabar de uma conquista."
  ],
  "arrependimento": [
    "Faça um breve exame de consciência antes de dormir e peça perdão por suas falhas.",
    "Peça desculpas diretamente a alguém com quem você foi rude recentemente.",
    "Abstenha-se de algo lícito hoje (um doce, café) como ato de reparação silenciosa.",
    "Reze um ato de contrição com o coração sinceramente voltado a Deus."
  ],
  "paciência": [
    "Evite responder imediatamente quando sentir irritação por algo pequeno.",
    "Suporte os defeitos de alguém hoje sem revirar os olhos ou suspirar.",
    "Aguarde na fila ou no trânsito sem reclamar mentalmente ou em voz alta.",
    "Dê uma resposta mansa quando alguém te fizer uma pergunta óbvia."
  ],
  "caridade": [
    "Dê uma esmola ou faça uma doação sem que ninguém saiba.",
    "Separe uma roupa ou objeto em bom estado para doar.",
    "Ajude alguém no trabalho ou em casa em uma tarefa que não é sua obrigação.",
    "Reze uma dezena do terço pelas necessidades de uma pessoa específica."
  ],
  "pureza": [
    "Desvie imediatamente o olhar de qualquer imagem ou pensamento indecoroso.",
    "Evite fofocas ou conversas maliciosas mudando de assunto discretamente.",
    "Corte o uso de uma rede social hoje para focar a mente nas coisas do alto.",
    "Reze 3 Ave-Marias pedindo à Virgem Maria a graça de um coração puro."
  ],
  "fé": [
    "Faça o Sinal da Cruz com verdadeira atenção e reverência antes das refeições.",
    "Visite uma igreja por 5 minutos apenas para saudar Jesus no sacrário.",
    "Reze o Credo ao acordar, afirmando suas verdades de forma consciente.",
    "Leia um trecho do Evangelho e passe 2 minutos refletindo em silêncio sobre ele."
  ],
  "confiança em Deus": [
    "Não reclame hoje sobre dinheiro, tempo ou circunstâncias fora do seu controle.",
    "Quando sentir ansiedade, repita mentalmente: 'Jesus, eu confio em Vós'.",
    "Agradeça a Deus por uma dificuldade recente, reconhecendo que Ele tem um plano.",
    "Abandone uma preocupação específica nas mãos de Deus, decidindo não sofrer por antecipação."
  ],
  "vigilância": [
    "Coloque um alarme no meio do dia para parar por 1 minuto e lembrar da presença de Deus.",
    "Vigie suas palavras: corte a frase no meio se perceber que será uma fofoca ou queixa.",
    "Preste atenção total às pessoas hoje, evitando checar o celular enquanto conversam.",
    "Antes de abrir um aplicativo por tédio, reze uma pequena oração."
  ],
  "obediência": [
    "Cumpra imediatamente uma obrigação chata que você estava procrastinando.",
    "Obedeça prontamente as regras de trânsito ou normas do local, mesmo quando ninguém vê.",
    "Aceite a decisão do seu superior ou líder sem murmurar pelas costas.",
    "Faça suas orações nos horários estabelecidos, sem atrasos."
  ]
};
