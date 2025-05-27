import React from 'react';
import { useForm } from 'react-hook-form';

type FilterFormProps = {
  groupName: string;
  onAddFilter: (groupName: string, filterName: string) => void;
};

const FilterForm: React.FC<FilterFormProps> = ({ groupName, onAddFilter }) => {
  const { register, handleSubmit, reset } = useForm<{ filterName: string }>();

  const onSubmit = (data: { filterName: string }) => {
    const filterName = data.filterName.trim();
    if (!filterName) return;
    onAddFilter(groupName, filterName);
    reset();
  };

  return (
<form onSubmit={handleSubmit(onSubmit)}>
  <div className="input-group">
    <input
      {...register('filterName')}
      className="form-control"
      placeholder={`Novi filter`}
    />
    <button type="submit" className="btn btn-success">
      Dodaj filter
    </button>
  </div>
</form>
  );
};

export default FilterForm;
