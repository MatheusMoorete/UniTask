import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'

export function GoogleAuthHelp({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-2 text-amber-500 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Como contornar o aviso do Google</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm">
            Quando você vir a tela "O Google não verificou este app", siga estes passos:
          </p>
          
          <div className="border rounded-md p-4 bg-muted/30">
            <ol className="list-decimal ml-5 space-y-3">
              <li className="text-sm">
                <span className="font-medium">Clique em "Avançado"</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Geralmente localizado no canto inferior esquerdo da tela de aviso
                </p>
              </li>
              
              <li className="text-sm">
                <span className="font-medium">Clique em "Acessar UniTask (não seguro)"</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Aparecerá um link após clicar em "Avançado"
                </p>
              </li>
              
              <li className="text-sm">
                <span className="font-medium">Escolha sua conta do Google</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione a conta que deseja usar com o UniTask
                </p>
              </li>
              
              <li className="text-sm">
                <span className="font-medium">Clique em "Continuar"</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirme as permissões solicitadas (apenas leitura do calendário)
                </p>
              </li>
            </ol>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">Nota:</span> O UniTask solicita apenas permissões de leitura do seu calendário. 
              Seus dados estão seguros e você pode revogar o acesso a qualquer momento na página 
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                Permissões das Contas do Google
              </a>.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Entendi</Button>
        </div>
      </div>
    </div>
  )
} 