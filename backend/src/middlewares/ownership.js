const { fail } = require('../utils/response');

/**
 * Ownership middleware factory.
 * Loads the resource by id, checks `userId` against req.user._id (admin bypass),
 * and attaches the document to req for the controller to reuse.
 *
 *   router.delete('/:id', auth, owns(Expense), ctrl.remove)
 *
 * Admins always pass.
 */
const owns = (Model, opts = {}) => async (req, res, next) => {
  try {
    const id = req.params[opts.param || 'id'];
    const doc = await Model.findById(id);
    if (!doc) return fail(res, `${Model.modelName} not found`, 404);
    if (req.user.role !== 'admin' && String(doc.userId) !== String(req.user._id)) {
      return fail(res, 'Forbidden: not the resource owner', 403);
    }
    req.resource = doc;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = owns;
