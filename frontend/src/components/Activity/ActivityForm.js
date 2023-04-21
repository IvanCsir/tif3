const ActivityForm= (activity) => {

    return (<div className="col-md-3 mx-auto">
    <h2 className="mb-3 text-center">Activity</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input type="text" name="name" maxLength="50" value={activity.name} onChange={handleInputChange} className="form-control" minLength="2" autoFocus required />
      </div>
      <div className="mb-3">
        <label className="form-label">Descripcion</label>
        <input type="text" name="description" maxLength="255" value={activity.foundation} onChange={handleInputChange} className="form-control" min="1900" max="2020" required />
      </div>
      <div className="d-grid gap-2">
        {params.id ? (
          <button type="submit" className="btn btn-block btn-primary">
            Update
          </button>
        ) : (
          <button type="submit" className="btn btn-block btn-success">
            Register
          </button>
        )}
      </div>
    </form>
  </div>)
};

export default ActivityForm;