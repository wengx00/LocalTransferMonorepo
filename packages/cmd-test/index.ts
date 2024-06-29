import { Service } from 'local-transfer-service';

const service = new Service({
  downloadRoot: './',
});

service.addReceiveFileHandler((context) => {
  console.log('receive file: ', context);
});

service.addAvailableServicesUpdateHandler(() => {
  const currentAvailableServices = service.getAvailableServices();

  currentAvailableServices.forEach(({ id }) => {
    service.addVerifiedDevice(id);
  });
});

setTimeout(() => {
  const currentAvailableServices = service.getAvailableServices();
  console.log('Current available services: ', currentAvailableServices);
  const task = service.sendFile({
    path: './package.json',
    targetId: currentAvailableServices[0].id,
    onLaunch(context) {
      console.log('onLaunch: ', context);
    },
    onProgress(context) {
      console.log('onProgress: ', context);
    },
  });
  task
    .then((res) => {
      console.log('传输成功', res);
    })
    .catch((err) => {
      console.log('传输失败', err);
    });
}, 10000);
