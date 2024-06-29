import { Service } from 'local-transfer-service';

const service = new Service({
  downloadRoot: './',
});

service.addReceiveFileHandler((context) => {
  console.log('receive file: ', context);
});
