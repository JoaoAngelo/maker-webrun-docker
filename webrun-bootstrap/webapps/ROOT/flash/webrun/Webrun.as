package flash.webrun {
    import flash.display.Sprite;
    import flash.events.*;
    import flash.external.ExternalInterface;

    public class Webrun extends Sprite {

        public function Webrun() {
        }
		
		/**
		*
		* Executa um fluxo cliente no Webrun
		* @ruleName: Nome do fluxo a ser executado
		* @params: (Opcional) Os demais argumentos são parâmetros passados ao fluxo
		*
		*/
		public static function executeClientRule(ruleName:String, ...ruleParams) : Object {
			if (ExternalInterface.available) {
                try {
  				  return ExternalInterface.call("executeFromActionScript", ruleName, ruleParams, false);
                } catch (error:SecurityError) {
                    trace("A SecurityError occurred: " + error.message + "\n");
                } catch (error:Error) {
                    trace("An Error occurred: " + error.message + "\n");
                }		
            } else {
                trace("External interface is not available for this container.");
            }
			return null;
		}
		
		/**
		*
		* Executa um fluxo servidor no Webrun
		* @ruleName: Nome do fluxo a ser executado
		* @params: (Opcional) Os demais argumentos são parâmetros passados ao fluxo
		*
		*/
		public static function executeServerRule(ruleName:String, ...ruleParams) : Object {
			if (ExternalInterface.available) {
                try {
  				  return ExternalInterface.call("executeFromActionScript", ruleName, ruleParams, true);
                } catch (error:SecurityError) {
                    trace("A SecurityError occurred: " + error.message + "\n");
                } catch (error:Error) {
                    trace("An Error occurred: " + error.message + "\n");
                }		
            } else {
                trace("External interface is not available for this container.");
            }
			return null;
		}
    }
}