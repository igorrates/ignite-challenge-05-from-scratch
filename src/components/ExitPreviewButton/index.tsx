import styles from './exitbutton.module.scss'

export default function ExitPreviewButton() {
  return (
      <a className={styles.exitButton} href="/api/exit-preview">Exit Preview</a>
  )
}
