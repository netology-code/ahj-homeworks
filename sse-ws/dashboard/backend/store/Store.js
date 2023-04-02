class Store {
  constructor() {
    this.instances = [];
    this.listeners = [];
  }

  getTimestamp() {
    return `${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`;
  }

  addInstance(instance) {
    this.instances.push(instance);
    const logData = {
      id: instance.id,
      info: "Created",
      timeStamp: this.getTimestamp(),
    };
    this.sendEvent(logData);
  }

  changeStatus(id) {
    const isExist = this.instances.find((i) => i.id === id);
    if (!isExist) return;

    const index = this.instances.findIndex((i) => i.id === id);
    const item = this.instances[index];

    let info, newState;
    if (item.state === "stopped") {
      info = "Started";
      newState = "running";
    } else {
      info = "Stopped";
      newState = "stopped";
    }

    item.state = newState;

    const logData = {
      id,
      info,
      timeStamp: this.getTimestamp(),
    };

    this.sendEvent(logData);
  }

  removeInstance(id) {
    this.instances = this.instances.filter((item) => {
      return item.id !== id;
    });
    const logData = {
      id,
      info: "Removed",
      timeStamp: this.getTimestamp(),
    };
    this.sendEvent(logData);
  }

  listen(handler) {
    this.listeners.push(handler);
  }

  sendEvent(data) {
    return this.listeners.forEach((handler) => handler(data));
  }
}

export const store = new Store();
