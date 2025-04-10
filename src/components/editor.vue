<script lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import {onBeforeUnmount, ref, shallowRef, onMounted} from 'vue'
import {Editor, Toolbar} from "@wangeditor/editor-for-vue"
import {IToolbarConfig} from "@wangeditor/editor";
import {IEditorConfig} from "@wangeditor/editor";
import {useMainStore} from "../store";

export default {
  components: {Editor, Toolbar},
  props: { // ✅ 选项式 API 的 props 定义
    uploadUrl: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    console.log(props)
    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    const valueHtml = ref('')

    // 模拟 ajax 异步获取内容
    onMounted(() => {
      setTimeout(() => {
        valueHtml.value = ''
      }, 1500)
    })

    const toolbarConfig: Partial<IToolbarConfig> = {  // TS 语法
      // toolbarKeys: [
      //
      // ],
      MENU_CONF: {}
    }
    const editorConfig: Partial<IEditorConfig> = {   // TS 语法
      placeholder: '请输入。。。',
      MENU_CONF: {
        uploadImage: {
          server: props.uploadUrl,
          // form-data fieldName ，默认值 'wangeditor-uploaded-image'
          fieldName: 'file',
          meta: {
            // 额外参数
            token: useMainStore().token,
          },

          // 单个文件的最大体积限制，默认为 2M
          maxFileSize: 5 * 1024 * 1024, // 5M

          // 单个文件上传成功之后
          onSuccess(file: File, res: any) {
            console.log(`${file.name} 上传成功`, res)
          },
        },

        // 插入图片
        insertImage: {
          onInsertedImage(imageNode: ImageElement | null) {
            if (imageNode == null) return

            const {src, alt, url, href} = imageNode
            console.log('inserted image', src, alt, url, href)
          },
        },



        emotion: {
          emotions: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉'.split(' '),
        }
      }
    }


    const printHtml = () => {
      const editor = editorRef.value
      if (editor == null) return
      console.log(editor.getHtml());
    }


    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }

    return {
      printHtml,
      editorRef,
      valueHtml,
      mode: 'simple', //default 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated,
    }
  },
}
</script>

<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="overflow-y: hidden;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
    />
  </div>
</template>
<!--<link-->
<!--    href="https://unpkg.com/@wangeditor/editor@latest/dist/css/style.css"-->
<!--    rel="stylesheet"-->
<!--/>-->
<style>
.w-e-full-screen-container {
  z-index: 11;
}
.w-e-text-container {
  height: 92%;
}
</style>
