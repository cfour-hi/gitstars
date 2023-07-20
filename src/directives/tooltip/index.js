import './index.scss';

const directiveTooltip = (app) => {
  app.directive('tooltip', {
    mounted(el, binding) {
      init(el, binding);
    },
    updated(el, binding) {
      init(el, binding);
    },
  });
};

function init(el, binding) {
  let position = binding.arg ?? '';
  let tooltipText = binding.value ?? '';
  el.setAttribute('position', position);
  el.setAttribute('tooltip', tooltipText);
}

export default directiveTooltip;
