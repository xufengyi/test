import React, { Component } from 'react';
import { Form, Row, Col } from 'antd';
import moment from 'moment';
import GeneralInput from '@/components/GeneralInput';
import { containsKey } from '@/utils';
import styles from './index.less';

const rejectNull = opts => {
  if (!Array.isArray(opts)) {
    return [];
  }
  return opts.filter(o => o.key !== null);
}

@Form.create({ name: 'configForm' })
class ConfigForm extends Component {
  // 日期联动disable
  disabledDate = (current, configItem) => {
    const {
      form: { getFieldsValue },
    } = this.props;

    if (configItem.disabledDate) {
      return configItem.disabledDate(current, getFieldsValue());
    }

    return false;
  }

  renderFormItems = () => {
    const {
      config = [],
      form: { getFieldDecorator },
      onFieldChange,
      initialValues = {},
      asyncOptions = {},
    } = this.props;
    return config.map(item => {
      const {
        type,
        field,
        label,
        comProps,
        options,
        request,
        suffix,
        rules = [],
        col = 12,
        formItemLayout = {},
      } = item;

      // 对于异步获取的opts数组，可能存在key，value为null的情况，剔除
      let opts = null;
      if (typeof options === 'string') {
        opts = rejectNull(asyncOptions[options])
      } else if (typeof options === 'object' && typeof options.data === 'string') {
        opts = { ...options, data: rejectNull(asyncOptions[options.data]) };
      } else {
        opts = options;
      }

      let initialValue = initialValues[field];
      if (initialValue === null) {
        // Select组件值为undefined时才会显示placeholder
        initialValue = undefined;
      } else if (initialValue !== undefined) {
        if (type === 'DatePicker') {
          // String 转换成 Moment
          initialValue = moment(initialValue);
        }
        if ((type === 'Select' || type === 'RemoteSearchSelect') && !Array.isArray(initialValue)) {
          // Select组件对于不在option中的initValue置空，避免直接显示字符
          // 仅针对单选情况
          const found = containsKey(opts, initialValue) || containsKey(opts.data, initialValue);
          if (!found) {
            initialValue = undefined;
          }
        }
      }

      // 纯文本显示
      // 如何位置使用过：剖视图->阈值设置->阈值配置 界面
      if (type === 'Text') {
        return (
          <Col key={field} span={col}>
            <Form.Item label={label} {...formItemLayout} colon>
              <span {...comProps} className={styles.textItem} title={initialValue}>{initialValue || ''}</span>
            </Form.Item>
          </Col>
        )
      }

      let props = {
        ...comProps,
        type,
        options: opts,
        request, // 远程搜索
        style: { width: '100%' },
        onChange: value => onFieldChange && onFieldChange(field, value),
      };

      if (type === 'DatePicker') {
        props = {
          ...props, disabledDate: current => this.disabledDate(current, item),
        }
      }

      const component = <GeneralInput suffix={suffix} {...props} />;

      return (
        <Col key={field} span={col}>
          <Form.Item label={label} {...formItemLayout}>
            {getFieldDecorator(field, { rules, initialValue })(component)}
          </Form.Item>
        </Col>
      )
    })
  }

  render() {
    const { formProps } = this.props;
    return (
      <Form {...formProps}>
        <Row align="bottom" type="flex" gutter={10}>
          {this.renderFormItems()}
        </Row>
      </Form>
    )
  }
}

export default ConfigForm;
