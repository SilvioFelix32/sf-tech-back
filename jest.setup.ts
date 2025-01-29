process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED PROMISE', reason);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION', error);
});

//Remover essa função, habilita a aparição dos logs no terminal durante os testes
global.console = {
  ...console,
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
