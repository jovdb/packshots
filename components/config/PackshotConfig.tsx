import { IPackshotConfig } from "../../src/IPackshot";
import { ConfigComponent } from "./factory";

export const PackshotConfig: ConfigComponent<IPackshotConfig> = ({
  config,
  onChange,
}) => {
  const {
    width = 700,
    height = 700,
  } = config || {};

  return (
    <fieldset>
      <legend>Export dimentions</legend>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td>Width:</td>
            <td>
              <input
                type="number"
                value={width}
                min={1}
                step={1}
                style={{ width: 60 }}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onChange({
                    ...config,
                    width: newValue,
                  });
                }}
              />
              &nbsp;px
            </td>
          </tr>
          <tr>
            <td>Height:</td>
            <td>
              <input
                type="number"
                value={height}
                min={1}
                step={1}
                style={{ width: 60 }}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onChange({
                    ...config,
                    height: newValue,
                  });
                }}
              />
              &nbsp;px
            </td>
          </tr>
          {
            /*
                        <tr>
                            <td>Transaprent:</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={isTransparent}
                                    onChange={(e) => {
                                        onChange({
                                            ...config,
                                            isTransparent: e.target.checked,
                                        });
                                    }}
                                />
                            </td>
                        </tr>
                    */
          }
          <tr>
            <td colSpan={2} style={{ textAlign: "right" }}>
              <button onClick={() => alert("todo")}>Export as PNG</button>
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>
  );
};
