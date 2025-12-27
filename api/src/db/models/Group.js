module.exports = class Group {
  id = null;
  name = null;
  description = null;
  owner = null;
  members = null;
  albums = null;

  constructor(data) {
    this.id = data.grp_id;
    this.name = data.grp_name;
    this.description = data.grp_description;
    this.owner = data.grp_usr_id;
    this.members = data.grp_members;
    this.albums = data.grp_albums;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      owner: this.owner,
      members: this.members,
      albums: this.albums
    }
  }
};