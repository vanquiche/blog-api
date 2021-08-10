exports.index = (req, res) => {
  res.render('admin', { title: 'Admin Portal' });
};

exports.get_new_blog = (req, res) => {
  res.send('new blog post not yet implemented');
};
exports.post_new_blog = (req, res) => {
  res.send('post not implemented yet')
}

exports.show_blogs = (req, res) => {
  res.send('show blog posts not yet implemented');
};

exports.profile = (req, res) => {
  res.send('profile page not yet implemented');
};
