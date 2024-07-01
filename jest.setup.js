process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED PROMISE', reason);
});

process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION', error);
});