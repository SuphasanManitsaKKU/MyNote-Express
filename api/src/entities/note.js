class Note {
  constructor({ noteid, title, content, color, date, userid }) {
    this.noteid = noteid;
    this.title = title;
    this.content = content;
    this.color = color;
    this.date = date;
    this.userid = userid;
  }
}

module.exports = Note;
