import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Keyword from './components/Keyword.vue'
import Text from "@/components/Text.vue";

const keyword = createApp(Keyword)
keyword.use(ElementPlus)
keyword.mount('#Keyword')

const text = createApp(Text)
text.use(ElementPlus)
text.mount('#Text')