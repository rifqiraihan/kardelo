export interface PopupProps{
    open: boolean
    name?: string
    status?: string
    onSave: () => void
    onCancel: () => void
}