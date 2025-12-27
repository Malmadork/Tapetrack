module.exports = class List {
  id = null;
  name = null;
  userId = null;
  albums = null;
  datetime = null;

  constructor(data) {
    this.id = data.list_id;
    this.name = data.list_name;
    this.userId = data.usr_id;
    if(data.albums) this.albums = data.albums
    this.datetime = data.datetime;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      albums: Number(this.albums),
      datetime: this.datetime
    }
  }
};