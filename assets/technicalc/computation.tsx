import { A, classNames, InlineSvg } from "../../core";

export const fragment = true;

const noop = () => {};

export default () => (
  <>
    <div>
      <button className={classNames("computation__close")}>Close</button>
      <h3 className={classNames("computation__header")}>Computation</h3>
    </div>

    <div className={classNames("computation__maths-container")}>
      <div className={classNames("computation__input computation--loading")} />
      <div className={classNames("computation__result computation--loading")} />
      <div className={classNames("computation__spinner")}>
        <InlineSvg src="/assets/technicalc/loading.svg" />
      </div>
      <button className={classNames("computation__toggle-display-mode")}>
        <InlineSvg
          src="/assets/technicalc/ellipsis.svg"
          className="computation__toggle-display-mode-icon"
        />
        Display Mode
      </button>
    </div>

    <div className={classNames("computation__form-container")}>
      <form className={classNames("computation__form")}>
        <div
          className={classNames(
            "computation__radio-options computation__radio-options--check-ring"
          )}
        >
          <label className={classNames("computation__radio-option")}>
            <input
              type="radio"
              name="style"
              value="natural-mixed"
              onChange={noop}
            />
            <span>
              <InlineSvg src="/assets/technicalc/style-natural-mixed.svg" />
            </span>
            <span
              className={classNames("computation__radio-option-label-hidden")}
            >
              Natural (Mixed Fractions)
            </span>
          </label>
          <label className={classNames("computation__radio-option")}>
            <input type="radio" name="style" value="natural" onChange={noop} />
            <span>
              <InlineSvg src="/assets/technicalc/style-natural.svg" />
            </span>
            <span
              className={classNames("computation__radio-option-label-hidden")}
            >
              Natural
            </span>
          </label>
          <label className={classNames("computation__radio-option")}>
            <input
              type="radio"
              name="style"
              value="decimal"
              checked
              onChange={noop}
            />
            <span>
              <InlineSvg src="/assets/technicalc/style-decimal.svg" />
            </span>
            <span
              className={classNames("computation__radio-option-label-hidden")}
            >
              Decimal
            </span>
          </label>
          <label className={classNames("computation__radio-option")}>
            <input
              type="radio"
              name="style"
              value="engineering"
              onChange={noop}
            />
            <span>
              <InlineSvg src="/assets/technicalc/style-engineering.svg" />
            </span>
            <span
              className={classNames("computation__radio-option-label-hidden")}
            >
              Engineering
            </span>
          </label>
        </div>

        <label className={classNames("computation__select")}>
          Number Format
          <select name="numberFormat">
            {[
              {
                decimalSeparator: ".",
                groupingSeparator: ",",
                digitGrouping: true,
              },
              {
                decimalSeparator: ",",
                groupingSeparator: ".",
                digitGrouping: true,
              },
              {
                decimalSeparator: ".",
                groupingSeparator: " ",
                digitGrouping: true,
              },
              {
                decimalSeparator: ",",
                groupingSeparator: " ",
                digitGrouping: true,
              },
            ].map(({ decimalSeparator, groupingSeparator, digitGrouping }) => {
              const value = decimalSeparator + groupingSeparator;
              const title = `1${
                digitGrouping ? groupingSeparator : ""
              }234${decimalSeparator}56`;
              return (
                <option key={value} value={value}>
                  {title}
                </option>
              );
            })}
          </select>
        </label>

        <label className={classNames("computation__slider")}>
          Decimal Places
          <input
            type="range"
            name="precision"
            min="0"
            max="12"
            value="8"
            onChange={noop}
          />
        </label>

        <div className={classNames("computation__radio-options")}>
          <span className={classNames("computation__radio-option-title")}>
            Base
          </span>
          <label className={classNames("computation__radio-option")}>
            <input type="radio" name="base" value="2" onChange={noop} />
            <span>2</span>
          </label>
          <label className={classNames("computation__radio-option")}>
            <input type="radio" name="base" value="8" onChange={noop} />
            <span>8</span>
          </label>
          <label className={classNames("computation__radio-option")}>
            <input
              type="radio"
              name="base"
              value="10"
              checked
              onChange={noop}
            />
            <span>10</span>
          </label>
          <label className={classNames("computation__radio-option")}>
            <input type="radio" name="base" value="16" onChange={noop} />
            <span>16</span>
          </label>
        </div>
      </form>
    </div>

    <div className={classNames("computation__footer")}>
      <p className={classNames("computation__footer-copy")}>
        This equation was created with TechniCalc. <strong>Scroll down</strong>{" "}
        to learn more.
      </p>
      <A href="#" className="computation__open-in-app">
        Open in App
      </A>
    </div>
  </>
);
