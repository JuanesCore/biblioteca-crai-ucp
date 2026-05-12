const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDatabases = async () => {
  await wait(350);
  return [
    {
      id: "scielo",
      name: "SciELO",
      description: "Coleccion de revistas cientificas de acceso abierto.",
      source: "mock",
    },
    {
      id: "dialnet",
      name: "Dialnet",
      description: "Literatura academica hispana para docencia e investigacion.",
      source: "mock",
    },
    {
      id: "redalyc",
      name: "Redalyc",
      description: "Articulos y publicaciones indexadas para consulta academica.",
      source: "mock",
    },
  ];
};

export const getArticles = async () => {
  await wait(400);
  return [
    {
      id: "article-1",
      title: "Tendencias de aprendizaje digital en universidades latinoamericanas",
      database: "SciELO",
      year: 2024,
      source: "mock",
    },
    {
      id: "article-2",
      title: "Experiencias de bibliotecas CRAI en contextos hibridos",
      database: "Dialnet",
      year: 2023,
      source: "mock",
    },
  ];
};

