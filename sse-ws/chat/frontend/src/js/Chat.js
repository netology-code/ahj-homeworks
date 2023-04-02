import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
  }

  init() {}

  bindToDOM() {}

  registerEvents() {}

  subscribeOnEvents() {}

  onEnterChatHandler() {}

  sendMessage() {}

  renderMessage() {}
}
